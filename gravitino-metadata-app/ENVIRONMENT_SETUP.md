# Environment Setup Guide

## Tạo file .env.local

Tạo file `.env.local` trong root directory của project với nội dung sau:

```bash
# Gravitino Server Configuration
GRAVITINO_SERVER_URL=http://localhost:8090
GRAVITINO_METALAKE=metalake_demo

# Cursor AI Configuration
CURSOR_API_KEY=your_cursor_api_key

# MCP Configuration (internal proxy)
MCP_BASE_URL=/api/mcp

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Cấu hình Cursor MCP

Tạo file `~/.cursor/mcp.json` (hoặc `%APPDATA%/Cursor/mcp.json` trên Windows):

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

## Khởi động Services

### 1. Start Gravitino Server
```bash
# Sử dụng Docker
docker run -d --name gravitino-server \
  -p 8090:8090 \
  apache/gravitino:latest

# Verify server
curl http://localhost:8090/api/metalakes
```

### 2. Start Web App
```bash
cd gravitino-metadata-app
npm install
npm run dev
```

### 3. Verify MCP Connection
- Mở AI Assistant page
- Kiểm tra MCP Server Status
- Nếu "Connected", bạn có thể sử dụng AI Assistant

## Troubleshooting

### MCP Server Status: Disconnected

**Nguyên nhân có thể:**
1. Gravitino server chưa chạy
2. Sai cấu hình environment variables
3. Network connectivity issues

**Giải pháp:**
1. Kiểm tra Gravitino server:
   ```bash
   curl http://localhost:8090/api/metalakes
   ```

2. Kiểm tra environment variables:
   ```bash
   echo $GRAVITINO_SERVER_URL
   echo $GRAVITINO_METALAKE
   ```

3. Restart web app:
   ```bash
   npm run dev
   ```

### Cursor MCP không hoạt động

**Kiểm tra:**
1. File `~/.cursor/mcp.json` có đúng format không
2. Restart Cursor
3. Kiểm tra logs trong Cursor

### API Errors

**Kiểm tra:**
1. Network tab trong browser DevTools
2. Server logs
3. Environment variables

## Production Setup

### Environment Variables
```bash
# Production
GRAVITINO_SERVER_URL=https://your-gravitino-server.com
GRAVITINO_METALAKE=production_metalake
CURSOR_API_KEY=your_production_cursor_key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secure_secret
```

### Security
- Sử dụng HTTPS cho production
- Secure API keys
- Enable authentication
- Configure CORS properly

## Monitoring

### Health Check
```bash
# Check Gravitino server
curl http://localhost:8090/api/metalakes

# Check MCP proxy
curl http://localhost:3000/api/mcp
```

### Logs
- Web app logs: `npm run dev`
- Gravitino logs: `docker logs gravitino-server`
- Cursor logs: Check Cursor's log directory
