#!/usr/bin/env python3
import os
import re
import subprocess
from pathlib import Path

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

PROJECT_ROOT = Path(
    os.environ.get("MCP_PROJECT_ROOT", os.getcwd())
).resolve()

IGNORED_DIRS = {".git", "node_modules", "__pycache__", ".venv", "dist", "build"}

MAX_FILE_SIZE = 50_000  # bytes

DENY_FILES = {
    ".env", ".env.local", ".env.production", ".env.development",
    "credentials.json", "service-account.json", ".htpasswd",
}
DENY_EXTENSIONS = {".pem", ".key", ".pfx", ".p12", ".jks", ".keystore"}

server = Server("project-guide")


def _resolve(path: str) -> Path:
    p = (PROJECT_ROOT / path).resolve()
    if not str(p).startswith(str(PROJECT_ROOT)):
        raise ValueError(f"Access denied: outside project root")
    return p


def _build_project_tree(root: Path, prefix: str = "", max_depth: int = 3) -> str:
    """Return a compact directory tree up to max_depth."""
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
            extension = "    " if is_last else "│   "
            lines.append(_build_project_tree(entry, prefix + extension, max_depth - 1))

    return "\n".join(line for line in lines if line)


@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="read_file",
            description="Read a file from the project. Path is relative to project root.",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path relative to project root, e.g. README.md or backend/cmd/backend/main.go",
                    }
                },
                "required": ["path"],
            },
        ),
        Tool(
            name="list_directory",
            description="List contents of a directory. Use '.' for the project root.",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Directory path relative to project root, e.g. backend/internal/",
                    }
                },
                "required": ["path"],
            },
        ),
        Tool(
            name="search_code",
            description="Search for text or regex in project source files. Returns matching file paths and line excerpts.",
            inputSchema={
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
        ),
        Tool(
            name="get_project_structure",
            description="Return the project directory tree (folders and key files). Use this to understand the overall layout.",
            inputSchema={
                "type": "object",
                "properties": {},
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "read_file":
        path = arguments["path"]
        p = _resolve(path)
        if not p.exists():
            return [TextContent(type="text", text=f"Error: file not found: {path}")]
        if p.is_dir():
            return [TextContent(type="text", text=f"Error: {path} is a directory, use list_directory instead")]
        if p.name.lower() in DENY_FILES:
            return [TextContent(type="text", text=f"Error: access denied — {p.name} contains secrets")]
        if p.suffix.lower() in DENY_EXTENSIONS:
            return [TextContent(type="text", text=f"Error: access denied — {p.suffix} files are not readable")]
        size = p.stat().st_size
        if size > MAX_FILE_SIZE:
            return [TextContent(type="text", text=f"Error: file too large ({size} bytes, max {MAX_FILE_SIZE})")]
        content = p.read_text()
        return [TextContent(type="text", text=content)]

    elif name == "list_directory":
        path = arguments["path"]
        p = _resolve(path)
        if not p.exists():
            return [TextContent(type="text", text=f"Error: directory not found: {path}")]
        if not p.is_dir():
            return [TextContent(type="text", text=f"Error: {path} is a file, use read_file instead")]

        lines = []
        for item in sorted(p.iterdir(), key=lambda e: (not e.is_dir(), e.name)):
            if item.name in IGNORED_DIRS:
                continue
            prefix = "/" if item.is_dir() else " "
            lines.append(f"{prefix} {item.name}")

        out = f"Contents of {path}:\n" + "\n".join(lines) if lines else "(empty)"
        return [TextContent(type="text", text=out)]

    elif name == "search_code":
        query = arguments["query"]
        search_dir = _resolve(arguments.get("path", "."))

        if not search_dir.exists():
            return [TextContent(type="text", text=f"Error: directory not found: {search_dir}")]

        escaped = query.replace("'", "'\\''")
        try:
            result = subprocess.run(
                ["grep", "-rn", "--include=*.go", "--include=*.ts", "--include=*.tsx",
                 "--include=*.py", "--include=*.yml", "--include=*.yaml", "--include=*.json",
                 "--include=*.sql", "--include=*.md", "--include=*.css",
                 "-e", escaped, str(search_dir)],
                capture_output=True, text=True, timeout=10,
            )
            out = result.stdout.strip()
            if not out:
                return [TextContent(type="text", text=f"No matches found for: {query}")]
            # Truncate if too much output
            if len(out) > 8000:
                out = out[:8000] + "\n... (truncated)"
            return [TextContent(type="text", text=out)]
        except subprocess.TimeoutExpired:
            return [TextContent(type="text", text="Search timed out")]

    elif name == "get_project_structure":
        tree = _build_project_tree(PROJECT_ROOT)
        return [TextContent(type="text", text=tree)]

    return [TextContent(type="text", text=f"Unknown tool: {name}")]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
