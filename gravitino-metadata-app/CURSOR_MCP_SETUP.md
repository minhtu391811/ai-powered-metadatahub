# Cấu hình Cursor MCP cho Gravitino

## Tổng quan

Hướng dẫn này sẽ giúp bạn cấu hình Cursor để kết nối với Gravitino MCP server, cho phép AI Assistant truy cập trực tiếp vào dữ liệu metadata Gravitino.

## Bước 1: Cài đặt Gravitino MCP Server

### Option 1: Sử dụng NPM Package
```bash
npm install -g @gravitino/mcp-server
```

### Option 2: Build từ source
```bash
git clone https://github.com/apache/gravitino.git
cd gravitino/mcp-server
npm install
npm run build
npm link
```

## Bước 2: Cấu hình Cursor

### 1. Tạo file cấu hình MCP
Tạo file `~/.cursor/mcp_config.json` (hoặc `%APPDATA%/Cursor/mcp_config.json` trên Windows):

```json
{
  "mcpServers": {
    "gravitino": {
      "command": "npx",
      "args": ["@gravitino/mcp-server"],
      "env": {
        "GRAVITINO_SERVER_URL": "http://localhost:8090",
        "GRAVITINO_METALAKE": "metalake_demo"
      }
    }
  }
}
```

### 2. Cấu hình Environment Variables
Tạo file `.env` trong project root:

```bash
# Gravitino Server Configuration
GRAVITINO_SERVER_URL=http://localhost:8090
GRAVITINO_METALAKE=metalake_demo

# Cursor Configuration
CURSOR_API_KEY=your_cursor_api_key

# MCP Server Configuration
MCP_BASE_URL=http://localhost:8000/mcp
```

## Bước 3: Khởi động Gravitino Server

### 1. Start Gravitino Server
```bash
# Sử dụng Docker
docker run -d --name gravitino-server \
  -p 8090:8090 \
  apache/gravitino:latest

# Hoặc build và chạy từ source
cd gravitino
./gradlew :server:run
```

### 2. Verify Gravitino Server
```bash
curl http://localhost:8090/api/metalakes
```

## Bước 4: Test MCP Connection

### 1. Test MCP Server
```bash
# Test MCP server trực tiếp
curl -X POST http://localhost:8000/mcp/getListOfCatalogs \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 2. Test trong Cursor
Mở Cursor và kiểm tra:
- MCP server status trong AI Assistant
- Có thể gọi các Gravitino tools
- Dữ liệu metadata được trả về chính xác

## Bước 5: Cấu hình Web App

### 1. Update API Route
File `app/api/chat/route.ts` đã được cấu hình để sử dụng Cursor:

```typescript
const result = streamText({
  model: "cursor", // Sử dụng Cursor thay vì Gemini
  system: `You are a helpful AI assistant powered by Cursor...`,
  tools: tools, // Gravitino MCP tools
  // ...
})
```

### 2. Environment Variables
Đảm bảo các biến môi trường được set:

```bash
# .env.local
CURSOR_API_KEY=your_cursor_api_key
GRAVITINO_SERVER_URL=http://localhost:8090
GRAVITINO_METALAKE=metalake_demo
MCP_BASE_URL=http://localhost:8000/mcp
```

## Troubleshooting

### 1. MCP Server không khởi động
```bash
# Kiểm tra logs
npx @gravitino/mcp-server --verbose

# Kiểm tra port
netstat -tulpn | grep 8000
```

### 2. Cursor không kết nối được MCP
- Kiểm tra file cấu hình MCP
- Restart Cursor
- Kiểm tra environment variables

### 3. Gravitino Server không accessible
```bash
# Kiểm tra Gravitino server
curl http://localhost:8090/api/metalakes

# Kiểm tra logs
docker logs gravitino-server
```

### 4. Tools không hoạt động
- Kiểm tra MCP server status trong UI
- Verify tool definitions
- Check network connectivity

## Advanced Configuration

### 1. Multiple Metalakes
```json
{
  "mcpServers": {
    "gravitino-dev": {
      "command": "npx",
      "args": ["@gravitino/mcp-server"],
      "env": {
        "GRAVITINO_SERVER_URL": "http://localhost:8090",
        "GRAVITINO_METALAKE": "dev_metalake"
      }
    },
    "gravitino-prod": {
      "command": "npx",
      "args": ["@gravitino/mcp-server"],
      "env": {
        "GRAVITINO_SERVER_URL": "http://prod-gravitino:8090",
        "GRAVITINO_METALAKE": "prod_metalake"
      }
    }
  }
}
```

### 2. Custom MCP Server
```json
{
  "mcpServers": {
    "custom-gravitino": {
      "command": "node",
      "args": ["./custom-mcp-server.js"],
      "env": {
        "GRAVITINO_SERVER_URL": "http://localhost:8090",
        "CUSTOM_CONFIG": "value"
      }
    }
  }
}
```

### 3. Authentication
```json
{
  "mcpServers": {
    "gravitino-secure": {
      "command": "npx",
      "args": ["@gravitino/mcp-server"],
      "env": {
        "GRAVITINO_SERVER_URL": "http://localhost:8090",
        "GRAVITINO_USERNAME": "admin",
        "GRAVITINO_PASSWORD": "password",
        "GRAVITINO_METALAKE": "secure_metalake"
      }
    }
  }
}
```

## Monitoring & Logs

### 1. MCP Server Logs
```bash
# Enable verbose logging
npx @gravitino/mcp-server --verbose --log-level debug
```

### 2. Cursor Logs
- Windows: `%APPDATA%/Cursor/logs/`
- macOS: `~/Library/Logs/Cursor/`
- Linux: `~/.config/Cursor/logs/`

### 3. Web App Logs
```bash
# Development logs
npm run dev

# Production logs
npm run build && npm start
```

## Performance Optimization

### 1. Connection Pooling
```json
{
  "mcpServers": {
    "gravitino": {
      "command": "npx",
      "args": ["@gravitino/mcp-server"],
      "env": {
        "GRAVITINO_SERVER_URL": "http://localhost:8090",
        "GRAVITINO_METALAKE": "metalake_demo",
        "CONNECTION_POOL_SIZE": "10",
        "CONNECTION_TIMEOUT": "30000"
      }
    }
  }
}
```

### 2. Caching
```json
{
  "mcpServers": {
    "gravitino": {
      "command": "npx",
      "args": ["@gravitino/mcp-server"],
      "env": {
        "GRAVITINO_SERVER_URL": "http://localhost:8090",
        "GRAVITINO_METALAKE": "metalake_demo",
        "CACHE_TTL": "300",
        "CACHE_SIZE": "1000"
      }
    }
  }
}
```

## Security Considerations

### 1. API Keys
- Sử dụng environment variables
- Không commit API keys vào git
- Rotate keys định kỳ

### 2. Network Security
- Sử dụng HTTPS cho production
- Configure firewall rules
- Enable authentication

### 3. Data Privacy
- Audit MCP server access
- Log all operations
- Implement access controls

## Next Steps

1. **Test Integration**: Verify tất cả tools hoạt động
2. **Create Sample Data**: Thêm sample metadata để test
3. **Monitor Performance**: Theo dõi response times
4. **Scale Up**: Configure cho production environment

## Support

- **Gravitino Documentation**: https://gravitino.apache.org/docs/
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Cursor Documentation**: https://cursor.sh/docs
- **Issues**: Tạo issue trên GitHub repository
