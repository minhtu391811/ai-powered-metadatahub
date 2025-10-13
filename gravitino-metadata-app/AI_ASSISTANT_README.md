# AI Assistant for Gravitino Metadata Hub

## Tổng quan

AI Assistant là một tính năng mạnh mẽ cho phép người dùng tương tác với Apache Gravitino metadata thông qua giao diện chat thân thiện. Assistant được powered bởi **Cursor AI** và tích hợp với MCP (Model Context Protocol) server để truy cập trực tiếp vào dữ liệu metadata thời gian thực.

## Tính năng chính

### 1. **Tương tác Chat Thông minh**
- Powered by **Cursor AI** - Model AI tiên tiến với MCP integration
- Giao diện chat trực quan và dễ sử dụng
- Hỗ trợ đa dạng câu hỏi về metadata
- Phản hồi nhanh chóng với dữ liệu thời gian thực
- Hiểu ngữ cảnh và cung cấp câu trả lời chính xác
- Truy cập trực tiếp vào Gravitino MCP server

### 2. **Kết nối MCP Server**
- Tích hợp trực tiếp với Gravitino MCP server
- Hiển thị trạng thái kết nối real-time
- Tự động kiểm tra kết nối mỗi 30 giây

### 3. **Tools Mạnh mẽ**
Assistant có quyền truy cập vào hơn 30 tools chuyên biệt:

#### **Core Metadata Tools:**
- `getListOfCatalogs`: Liệt kê tất cả catalogs
- `getListOfSchemas`: Xem schemas trong catalog
- `getListOfTables`: Liệt kê tables trong schema
- `getTableMetadataDetails`: Chi tiết schema của table

#### **Job Management Tools:**
- `listOfJobs`: Liệt kê tất cả jobs
- `listOfJobTemplates`: Xem job templates
- `getJobById`: Chi tiết job theo ID
- `runJob`: Chạy job với parameters
- `cancelJob`: Hủy job đang chạy

#### **Governance Tools:**
- `listOfTags`: Quản lý tags
- `getListOfPolicies`: Xem policies
- `listStatisticsForMetadata`: Thống kê metadata

#### **Advanced Tools:**
- `listOfModels`: Quản lý ML models
- `listOfTopics`: Streaming topics
- `listOfFilesets`: File-based datasets

### 4. **Hiển thị Kết quả Thông minh**
- Format dữ liệu đẹp mắt và dễ đọc
- Hiển thị structured data thay vì JSON raw
- Badge và icon trực quan
- Responsive layout

## Cách sử dụng

### 1. **Câu hỏi cơ bản**
```
"List all catalogs in the system"
"Show me all available job templates"
"What tables are available in the system?"
```

### 2. **Câu hỏi chi tiết**
```
"Get details for the users table in production_catalog.public"
"Show me all jobs and their current status"
"List all tags and their associated metadata"
```

### 3. **Quản lý Jobs**
```
"Run the data_processing job template with parameters: input_path=/data, output_path=/results"
"Cancel job with ID: job_12345"
"Show me the status of all running jobs"
```

### 4. **Khám phá Metadata**
```
"What models are available in the ml_catalog?"
"Show me the schema for the sales table"
"List all filesets in the data_catalog.raw schema"
```

## Cấu hình

### Environment Variables
```bash
# MCP Server URL (mặc định: http://localhost:8000/mcp)
MCP_BASE_URL=http://localhost:8000/mcp

# Cursor API Key (cho Cursor AI model)
CURSOR_API_KEY=your_cursor_api_key

# Gravitino Server Configuration
GRAVITINO_SERVER_URL=http://localhost:8090
GRAVITINO_METALAKE=metalake_demo
```

### MCP Server Setup
1. Đảm bảo MCP server đang chạy
2. Cấu hình kết nối đến Gravitino server
3. Kiểm tra trạng thái kết nối trong UI

## Troubleshooting

### 1. **MCP Server Disconnected**
- Kiểm tra MCP server có đang chạy không
- Xác nhận URL trong environment variables
- Kiểm tra network connectivity

### 2. **Tool Errors**
- Xem error message trong tool result
- Kiểm tra input parameters
- Đảm bảo metadata tồn tại

### 3. **Slow Responses**
- Kiểm tra network latency
- Xem MCP server performance
- Có thể cần tăng timeout settings

## Best Practices

### 1. **Câu hỏi hiệu quả**
- Sử dụng câu hỏi cụ thể và rõ ràng
- Bao gồm catalog/schema names khi cần
- Sử dụng suggested questions làm tham khảo

### 2. **Quản lý Jobs**
- Luôn kiểm tra job status trước khi chạy
- Sử dụng parameters phù hợp
- Monitor job execution

### 3. **Metadata Exploration**
- Bắt đầu với high-level overview (catalogs)
- Drill down vào schemas và tables
- Sử dụng tags và policies để organize

## API Reference

### Chat Endpoint
```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "List all catalogs"
    }
  ]
}
```

### MCP Tools
Tất cả tools được định nghĩa trong `/app/api/chat/mcpTools.ts` với:
- Input validation (Zod schemas)
- Error handling
- Timeout protection
- Type safety

## Security

- Tất cả requests đều được authenticate
- MCP server calls được bảo vệ bởi timeout
- Error messages không expose sensitive information
- Rate limiting được áp dụng

## Performance

- **Cursor AI**: Model nhanh và hiệu quả với MCP integration
- Tool calls có timeout 10 giây
- Connection status được cache
- UI được optimize cho large datasets
- Streaming responses cho better UX
- Direct access to Gravitino MCP server
- Real-time metadata queries

## Roadmap

- [ ] Support for custom tool definitions
- [ ] Advanced query builder
- [ ] Export functionality
- [ ] Multi-language support
- [ ] Voice interface
- [ ] Mobile app integration
