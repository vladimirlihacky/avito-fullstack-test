#!/usr/bin/env python3
"""OpenAI-compatible proxy that enriches LLM requests with filesystem tools.

Self-contained — tools are embedded directly (synchronous execution).
The MCP server (server.py) is a standalone reference and can be used by
other MCP clients; this proxy does NOT depend on it at runtime.

Flow:
  Incoming /v1/chat/completions request
    -> add tool definitions
    -> forward to upstream LLM (e.g. DeepSeek)
    -> if LLM returns tool_calls: execute locally, feed results back, repeat
    -> return final text-only response
"""

import json
import os
import re
import subprocess
from pathlib import Path

import httpx
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse

UPSTREAM_URL = os.environ.get("UPSTREAM_URL", "https://api.deepseek.com/v1")
UPSTREAM_API_KEY = os.environ.get(
    "UPSTREAM_API_KEY", os.environ.get("DEEPSEEK_API_KEY", "")
)
MAX_TOOL_ROUNDS = int(os.environ.get("MAX_TOOL_ROUNDS", "5"))
BIND_PORT = int(os.environ.get("PROXY_PORT", "8090"))
PROJECT_ROOT = Path(os.environ.get("MCP_PROJECT_ROOT", os.getcwd())).resolve()

IGNORED_DIRS = {".git", "node_modules", "__pycache__", ".venv", "dist", "build"}
MAX_FILE_SIZE = 50_000

# Files that must never be exposed — secrets, credentials, private keys
DENY_FILES = {
    ".env", ".env.local", ".env.production", ".env.development",
    "credentials.json", "service-account.json", ".htpasswd",
}
DENY_EXTENSIONS = {".pem", ".key", ".pfx", ".p12", ".jks", ".keystore"}

app = FastAPI(title="mcp-proxy")

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read a file from the project. Path is relative to project root.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path relative to project root, e.g. README.md or backend/cmd/backend/main.go",
                    }
                },
                "required": ["path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_directory",
            "description": "List contents of a directory. Use '.' for the project root.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Directory path relative to project root, e.g. backend/internal/",
                    }
                },
                "required": ["path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_code",
            "description": "Search for text or regex in project source files. Returns matching file paths and line excerpts.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Text or regex to search for",
                    },
                    "path": {
                        "type": "string",
                        "description": "Subdirectory to search in (defaults to project root)",
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_project_structure",
            "description": "Return the project directory tree (folders and key files). Use this to understand the overall layout.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]

def _resolve(path: str) -> Path:
    p = (PROJECT_ROOT / path).resolve()
    if not str(p).startswith(str(PROJECT_ROOT)):
        raise ValueError(f"Access denied: outside project root")
    return p


def _build_tree(root: Path, prefix: str = "", max_depth: int = 3) -> str:
    if max_depth == 0:
        return ""
    lines = []
    try:
        entries = sorted(
            [e for e in root.iterdir() if e.name not in IGNORED_DIRS],
            key=lambda e: (not e.is_dir(), e.name),
        )
    except PermissionError:
        return f"{prefix}[permission denied]"
    for i, entry in enumerate(entries):
        is_last = i == len(entries) - 1
        connector = "└── " if is_last else "├── "
        lines.append(f"{prefix}{connector}{entry.name}")
        if entry.is_dir():
            ext = "    " if is_last else "│   "
            sub = _build_tree(entry, prefix + ext, max_depth - 1)
            if sub:
                lines.append(sub)
    return "\n".join(lines)


def execute_tool(name: str, arguments: dict) -> str:
    if name == "read_file":
        p = _resolve(arguments["path"])
        if not p.exists():
            return f"Error: file not found: {arguments['path']}"
        if p.is_dir():
            return f"Error: {arguments['path']} is a directory"
        if p.name.lower() in DENY_FILES:
            return f"Error: access denied — {p.name} contains secrets"
        if p.suffix.lower() in DENY_EXTENSIONS:
            return f"Error: access denied — {p.suffix} files are not readable"
        if p.stat().st_size > MAX_FILE_SIZE:
            return f"Error: file too large ({p.stat().st_size} bytes)"
        return p.read_text()

    if name == "list_directory":
        p = _resolve(arguments["path"])
        if not p.exists():
            return f"Error: directory not found: {arguments['path']}"
        if not p.is_dir():
            return f"Error: {arguments['path']} is a file"
        lines = []
        for item in sorted(p.iterdir(), key=lambda e: (not e.is_dir(), e.name)):
            if item.name in IGNORED_DIRS:
                continue
            prefix = "/" if item.is_dir() else " "
            lines.append(f"{prefix} {item.name}")
        out = f"Contents of {arguments['path']}:\n" + "\n".join(lines)
        return out if lines else f"{arguments['path']} is empty"

    if name == "search_code":
        query = arguments["query"]
        search_dir = _resolve(arguments.get("path", "."))
        if not search_dir.exists():
            return f"Error: directory not found: {search_dir}"
        escaped = query.replace("'", "'\\''")
        try:
            result = subprocess.run(
                [
                    "grep", "-rn",
                    "--include=*.go", "--include=*.ts", "--include=*.tsx",
                    "--include=*.py", "--include=*.yml", "--include=*.yaml",
                    "--include=*.json", "--include=*.sql", "--include=*.md",
                    "--include=*.css",
                    "-e", escaped,
                    str(search_dir),
                ],
                capture_output=True, text=True, timeout=10,
            )
            out = result.stdout.strip()
            if not out:
                return f"No matches found for: {query}"
            if len(out) > 8000:
                out = out[:8000] + "\n... (truncated)"
            return out
        except subprocess.TimeoutExpired:
            return "Search timed out"

    if name == "get_project_structure":
        return _build_tree(PROJECT_ROOT)

    return f"Unknown tool: {name}"


async def run_with_tools(
    model: str,
    messages: list[dict],
    http_client: httpx.AsyncClient,
    api_key: str,
) -> str:
    for round_idx in range(MAX_TOOL_ROUNDS):
        payload = {
            "model": model,
            "messages": messages,
            "tools": TOOLS,
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        print(f"[mcp-proxy] Round {round_idx + 1}: calling {UPSTREAM_URL} with {len(messages)} messages and {len(TOOLS)} tools")

        resp = await http_client.post(
            f"{UPSTREAM_URL}/chat/completions",
            json=payload,
            headers=headers,
            timeout=60.0,
        )

        if resp.status_code != 200:
            text = resp.text[:500]
            raise RuntimeError(f"Upstream LLM error {resp.status_code}: {text}")

        data = resp.json()
        choice = data["choices"][0]
        message = choice["message"]

        if message.get("tool_calls"):
            tool_names = [tc["function"]["name"] for tc in message["tool_calls"]]
            print(f"[mcp-proxy] Tool calls requested: {tool_names}")

            messages.append({
                "role": "assistant",
                "content": message.get("content"),
                "tool_calls": message["tool_calls"],
            })

            for tc in message["tool_calls"]:
                fn_name = tc["function"]["name"]
                fn_args = json.loads(tc["function"]["arguments"])
                print(f"[mcp-proxy] Executing {fn_name}({json.dumps(fn_args, ensure_ascii=False)[:100]})")
                try:
                    tool_result = execute_tool(fn_name, fn_args)
                except Exception as exc:
                    tool_result = f"Tool error: {exc}"
                print(f"[mcp-proxy] {fn_name} result: {len(tool_result)} chars")
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc["id"],
                    "content": tool_result,
                })

            continue

        content = message.get("content", "")
        print(f"[mcp-proxy] Final response: {len(content)} chars")
        return content

    return "[mcp-proxy] Reached maximum tool-calling rounds without a final response."


def _sse_chunk(model: str, content: str = "", role: str = "", finish: bool = False) -> str:
    """Build a single SSE data line for an OpenAI-compatible streaming chunk."""
    delta: dict = {}
    if role:
        delta["role"] = role
    if content:
        delta["content"] = content
    chunk = {
        "id": "mcp-proxy-0",
        "object": "chat.completion.chunk",
        "created": 0,
        "model": model,
        "choices": [{
            "index": 0,
            "delta": delta,
            "finish_reason": "stop" if finish else None,
        }],
    }
    return f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"


async def _stream_response(model: str, output: str):
    """Yield SSE chunks line-by-line so downstream receives incremental chunks.
    No trailing newlines — the consumer adds separators."""
    yield _sse_chunk(model, role="assistant")
    for line in output.split("\n"):
        yield _sse_chunk(model, content=line)
    yield _sse_chunk(model, finish=True)
    yield "data: [DONE]\n\n"


@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    body = await request.json()
    model = body.get("model", "deepseek-chat")
    messages = body.get("messages", [])
    stream = body.get("stream", False)

    auth_header = request.headers.get("Authorization", "")
    api_key = UPSTREAM_API_KEY
    if auth_header.startswith("Bearer "):
        api_key = auth_header.removeprefix("Bearer ")

    if not api_key:
        return JSONResponse(
            {"error": "No API key configured for MCP proxy"},
            status_code=500,
        )

    async with httpx.AsyncClient() as client:
        try:
            output = await run_with_tools(model, messages, client, api_key)
        except RuntimeError as e:
            return JSONResponse({"error": str(e)}, status_code=502)

    if stream:
        return StreamingResponse(
            _stream_response(model, output),
            media_type="text/event-stream",
        )

    return {
        "id": "mcp-proxy-0",
        "object": "chat.completion",
        "created": 0,
        "model": model,
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": output},
            "finish_reason": "stop",
        }],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    }


@app.get("/health")
async def health():
    return {"status": "ok", "upstream": UPSTREAM_URL}


if __name__ == "__main__":
    print(f"[mcp-proxy] Project root: {PROJECT_ROOT}")
    print(f"[mcp-proxy] Upstream: {UPSTREAM_URL}")
    print(f"[mcp-proxy] Tools: {[t['function']['name'] for t in TOOLS]}")
    print(f"[mcp-proxy] Listening on 0.0.0.0:{BIND_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=BIND_PORT, log_level="info")
