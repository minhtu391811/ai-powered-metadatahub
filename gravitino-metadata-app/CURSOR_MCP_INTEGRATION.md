# Cursor MCP Integration với Gravitino

## Tổng quan

Hướng dẫn này sẽ giúp bạn cấu hình Cursor MCP server để kết nối với Gravitino và sử dụng Gemini API cho chat trên web.

## Kiến trúc

```
Web App (Next.js) 
    ↓ (AI SDK + Gemini)
MCP Proxy (/api/mcp-proxy)
    ↓ (Bypass CORS)
Cursor MCP Server (Port 8000)
    ↓ (MCP Protocol)
Gravitino Server (Port 8090)
```

**Lưu ý**: Sử dụng MCP Proxy để bypass CORS issues khi gọi MCP server từ browser.

## Bước 1: Cài đặt và Cấu hình

### 1. Khởi động Gravitino Server
```bash
# Sử dụng Docker
docker run -d --name gravitino-server \
  -p 8090:8090 \
  apache/gravitino:latest

# Verify
curl http://localhost:8090/api/metalakes
```

### 2. Cấu hình Cursor MCP
Tạo file `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "gravitino": {
      "url": "http://localhost:8000/mcp"
    }
  }
}
```

### 3. Khởi động MCP Server
```bash
# Sử dụng script tự động
chmod +x scripts/start-cursor-mcp.sh
./scripts/start-cursor-mcp.sh

# Hoặc manual
export GRAVITINO_SERVER_URL=http://localhost:8090
export GRAVITINO_METALAKE=metalake_demo
npx @gravitino/mcp-server --port 8000 --verbose
```

### 4. Cấu hình Environment Variables
Tạo file `.env.local`:
```bash
# Gravitino Server
GRAVITINO_SERVER_URL=http://localhost:8090
GRAVITINO_METALAKE=metalake_demo

# MCP Server (for proxy)
MCP_BASE_URL=http://localhost:8000/mcp

# Google AI (cho Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
```

## Bước 2: Khởi động Web App

```bash
cd gravitino-metadata-app
npm install
npm run dev
```

## Bước 3: Test Integration

### 1. Kiểm tra MCP Server
```bash
# Test MCP server
curl -X POST http://localhost:8000/mcp/getListOfCatalogs \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 2. Kiểm tra Web App
- Mở http://localhost:3000/dashboard/ai-assistant
- Kiểm tra "MCP Server Status" - phải hiển thị "Connected"
- Thử gửi message: "List all catalogs"

## Cách hoạt động

### 1. **Web App → Gemini API**
- Web app sử dụng AI SDK với Gemini model
- Gemini xử lý natural language và quyết định tools cần gọi

### 2. **Gemini → MCP Tools**
- Gemini gọi MCP tools thông qua AI SDK
- Tools được định nghĩa trong `mcpTools.ts`

### 3. **MCP Tools → MCP Proxy**
- Tools gọi tới `/api/mcp-proxy` (internal Next.js API)
- Sử dụng POST request với `{ toolName, input }`

### 4. **MCP Proxy → Cursor MCP Server**
- Proxy gọi tới `http://localhost:8000/mcp/{toolName}`
- Bypass CORS issues từ browser

### 5. **Cursor MCP Server → Gravitino**
- MCP server xử lý request và gọi Gravitino REST API
- Trả về kết quả cho web app

## Troubleshooting

### MCP Server Status: Disconnected

**Nguyên nhân:**
1. MCP server chưa chạy trên port 8000
2. Gravitino server chưa chạy trên port 8090
3. Sai cấu hình environment variables

**Giải pháp:**
```bash
# 1. Kiểm tra Gravitino
curl http://localhost:8090/api/metalakes

# 2. Kiểm tra MCP server
curl -X POST http://localhost:8000/mcp/getListOfCatalogs \
  -H "Content-Type: application/json" -d '{}'

# 3. Restart MCP server
./scripts/start-cursor-mcp.sh
```

### Chat Loading mãi

**Nguyên nhân:**
1. Gemini API key không đúng
2. MCP server không response
3. Network connectivity issues

**Giải pháp:**
```bash
# 1. Kiểm tra Gemini API key
echo $GOOGLE_GENERATIVE_AI_API_KEY

# 2. Kiểm tra MCP server logs
# Xem terminal chạy MCP server

# 3. Kiểm tra browser DevTools Network tab
```

### Cursor không nhận MCP

**Nguyên nhân:**
1. File `~/.cursor/mcp.json` sai format
2. Cursor chưa restart
3. MCP server không accessible

**Giải pháp:**
```bash
# 1. Kiểm tra config
cat ~/.cursor/mcp.json

# 2. Restart Cursor
# Close và mở lại Cursor

# 3. Kiểm tra MCP server
curl http://localhost:8000/mcp/getListOfCatalogs
```

## Advanced Configuration

### 1. Multiple Metalakes
```json
{
  "mcpServers": {
    "gravitino-dev": {
      "url": "http://localhost:8000/mcp",
      "env": {
        "GRAVITINO_METALAKE": "dev_metalake"
      }
    },
    "gravitino-prod": {
      "url": "http://localhost:8001/mcp",
      "env": {
        "GRAVITINO_METALAKE": "prod_metalake"
      }
    }
  }
}
```

### 2. Authentication
```json
{
  "mcpServers": {
    "gravitino-secure": {
      "url": "http://localhost:8000/mcp",
      "env": {
        "GRAVITINO_USERNAME": "admin",
        "GRAVITINO_PASSWORD": "password"
      }
    }
  }
}
```

### 3. Custom MCP Server
```json
{
  "mcpServers": {
    "custom-gravitino": {
      "command": "node",
      "args": ["./custom-mcp-server.js"],
      "env": {
        "GRAVITINO_SERVER_URL": "http://localhost:8090"
      }
    }
  }
}
```

## Monitoring & Logs

### 1. MCP Server Logs
```bash
# Verbose logging
npx @gravitino/mcp-server --port 8000 --verbose

# Log file
npx @gravitino/mcp-server --port 8000 --log-file mcp.log
```

### 2. Web App Logs
```bash
# Development
npm run dev

# Production
npm run build && npm start
```

### 3. Cursor Logs
- Windows: `%APPDATA%/Cursor/logs/`
- macOS: `~/Library/Logs/Cursor/`
- Linux: `~/.config/Cursor/logs/`

## Performance Optimization

### 1. Connection Pooling
```bash
export GRAVITINO_CONNECTION_POOL_SIZE=10
export GRAVITINO_CONNECTION_TIMEOUT=30000
```

### 2. Caching
```bash
export MCP_CACHE_TTL=300
export MCP_CACHE_SIZE=1000
```

### 3. Rate Limiting
```bash
export MCP_RATE_LIMIT=100
export MCP_RATE_WINDOW=60000
```

## Security Considerations

### 1. API Keys
- Sử dụng environment variables
- Không commit keys vào git
- Rotate keys định kỳ

### 2. Network Security
- Sử dụng HTTPS cho production
- Configure firewall rules
- Enable authentication

### 3. Data Privacy
- Audit MCP server access
- Log all operations
- Implement access controls

## Benefits

### 1. **Real-time Data Access**
- Truy cập trực tiếp vào Gravitino metadata
- Không cần cache hoặc sync data

### 2. **AI-powered Insights**
- Gemini hiểu context và cung cấp insights
- Natural language queries

### 3. **Seamless Integration**
- Cursor MCP protocol chuẩn
- Dễ dàng extend và customize

### 4. **Production Ready**
- Robust error handling
- Timeout protection
- Connection monitoring

## Next Steps

1. **Test Integration**: Verify tất cả components hoạt động
2. **Create Sample Data**: Thêm sample metadata để test
3. **Monitor Performance**: Theo dõi response times
4. **Scale Up**: Configure cho production environment
5. **Extend Features**: Thêm custom MCP tools

## Support

- **Gravitino Documentation**: https://gravitino.apache.org/docs/
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Cursor Documentation**: https://cursor.sh/docs
- **AI SDK**: https://sdk.vercel.ai/
- **Issues**: Tạo issue trên GitHub repository
