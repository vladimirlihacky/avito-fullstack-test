FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py proxy.py ./

ENV PROXY_PORT=8090
ENV MCP_PROJECT_ROOT=/project

EXPOSE 8090

CMD ["python", "proxy.py"]
