#!/bin/bash

# Script để khởi động Gravitino MCP Server

echo "🚀 Starting Gravitino MCP Server..."

# Kiểm tra Gravitino server
echo "📡 Checking Gravitino server..."
if curl -s http://localhost:8090/api/metalakes > /dev/null; then
    echo "✅ Gravitino server is running on http://localhost:8090"
else
    echo "❌ Gravitino server is not running on http://localhost:8090"
    echo "Please start Gravitino server first:"
    echo "  docker run -d --name gravitino-server -p 8090:8090 apache/gravitino:latest"
    exit 1
fi

# Kiểm tra port 8000
echo "🔍 Checking port 8000..."
if lsof -i :8000 > /dev/null 2>&1; then
    echo "⚠️  Port 8000 is already in use"
    echo "Killing existing process..."
    lsof -ti :8000 | xargs kill -9
    sleep 2
fi

# Khởi động MCP server
echo "🎯 Starting MCP server on port 8000..."

# Tạo simple MCP server nếu chưa có
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Kiểm tra xem có @gravitino/mcp-server không
if ! npx @gravitino/mcp-server --help > /dev/null 2>&1; then
    echo "📦 Installing @gravitino/mcp-server..."
    npm install -g @gravitino/mcp-server
fi

# Khởi động MCP server
echo "🚀 Starting MCP server..."
export GRAVITINO_SERVER_URL=http://localhost:8090
export GRAVITINO_METALAKE=metalake_demo
export MCP_SERVER_PORT=8000

npx @gravitino/mcp-server --port 8000 --verbose &
MCP_PID=$!

# Đợi server khởi động
echo "⏳ Waiting for MCP server to start..."
sleep 5

# Kiểm tra server
if curl -s http://localhost:8000/mcp/getListOfCatalogs -X POST -H "Content-Type: application/json" -d '{}' > /dev/null; then
    echo "✅ MCP server is running successfully on http://localhost:8000"
    echo "🔗 MCP Server PID: $MCP_PID"
    echo "📝 To stop the server: kill $MCP_PID"
else
    echo "❌ MCP server failed to start"
    kill $MCP_PID 2>/dev/null
    exit 1
fi

echo "🎉 MCP server is ready!"
echo "🌐 Web app can now connect to: http://localhost:8000/mcp"
