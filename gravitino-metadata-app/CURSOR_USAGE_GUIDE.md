# Hướng dẫn sử dụng Cursor Integration

## Tổng quan

AI Assistant hiện đã được tích hợp với Cursor AI để cung cấp khả năng phân tích code, tạo code và debug với context của Apache Gravitino. Điều này cho phép bạn:

- **Phân tích code** Gravitino với best practices
- **Tạo code** mới cho Gravitino development
- **Debug** các vấn đề liên quan đến metadata

## Cách sử dụng

### 1. **Code Analysis (Phân tích Code)**

Hỏi AI Assistant để phân tích code Gravitino:

```
"Analyze this Gravitino client code for best practices:

const client = new GravitinoClient({
  baseUrl: 'http://localhost:8090',
  metalake: 'metalake_demo'
});

async function getTableSchema(catalog, schema, table) {
  return await client.getTable(catalog, schema, table);
}"
```

**Kết quả sẽ bao gồm:**
- ✅ Phân tích chi tiết code
- 💡 Gợi ý cải thiện
- ⚠️ Các vấn đề tiềm ẩn
- 🛡️ Best practices cho Gravitino

### 2. **Code Generation (Tạo Code)**

Yêu cầu AI tạo code mới:

```
"Generate a function to create a new catalog in Gravitino with proper error handling and TypeScript types"
```

**Kết quả sẽ bao gồm:**
- ⚡ Code hoàn chỉnh và có thể chạy
- 📝 Giải thích chi tiết
- 📖 Hướng dẫn sử dụng
- 🔧 Best practices integration

### 3. **Debugging (Debug)**

Gửi code có lỗi để debug:

```
"Debug this code that's failing to connect to Gravitino:

async function connectToGravitino() {
  const response = await fetch('http://localhost:8090/api/metalakes');
  return response.json();
}"
```

**Kết quả sẽ bao gồm:**
- 🐛 Chẩn đoán vấn đề
- ✅ Giải pháp cụ thể
- 🔧 Code đã được sửa
- 🛡️ Tips phòng ngừa

## Ví dụ thực tế

### Ví dụ 1: Phân tích Job Template Code

**Input:**
```
"Analyze this job template creation code:

export async function createJobTemplate(template: JobTemplate) {
  const response = await fetch('/api/jobs/templates', {
    method: 'POST',
    body: JSON.stringify(template)
  });
  return response.json();
}"
```

**Output:**
- Phân tích về error handling
- Gợi ý thêm validation
- Best practices cho job templates
- Security considerations

### Ví dụ 2: Tạo Metadata Query Function

**Input:**
```
"Generate a function to query metadata statistics with pagination and filtering"
```

**Output:**
- Complete TypeScript function
- Pagination logic
- Filter implementation
- Error handling
- Usage examples

### Ví dụ 3: Debug Connection Issue

**Input:**
```
"Debug this connection error:

Error: Failed to connect to Gravitino server
Code: 
const client = new GravitinoClient({
  baseUrl: process.env.GRAVITINO_URL
});"
```

**Output:**
- Diagnosis: Missing environment variable
- Solution: Add proper env var handling
- Fixed code with validation
- Prevention tips

## Advanced Usage

### 1. **Context-aware Analysis**

Cung cấp context cụ thể:

```
"Analyze this code in the context of a production Gravitino deployment with high availability requirements:

[your code here]"
```

### 2. **Language-specific Generation**

Chỉ định ngôn ngữ lập trình:

```
"Generate a Python client for Gravitino metadata operations"
```

### 3. **Integration Patterns**

Hỏi về integration patterns:

```
"Generate code for integrating Gravitino with Apache Spark for metadata lineage tracking"
```

## Best Practices

### 1. **Cung cấp Context đầy đủ**
- Mô tả môi trường (dev, staging, production)
- Chỉ định requirements cụ thể
- Bao gồm constraints và limitations

### 2. **Sử dụng Specific Prompts**
- Thay vì: "Fix this code"
- Sử dụng: "Debug this Gravitino connection issue with proper error handling"

### 3. **Iterative Improvement**
- Bắt đầu với analysis
- Yêu cầu improvements
- Test và refine

## Troubleshooting

### 1. **Cursor API không khả dụng**
- AI sẽ tự động fallback về Gemini
- Vẫn cung cấp analysis và suggestions
- Chất lượng có thể khác một chút

### 2. **Code quá dài**
- Chia nhỏ code thành các phần
- Focus vào specific issues
- Sử dụng multiple queries

### 3. **Kết quả không chính xác**
- Cung cấp thêm context
- Sử dụng more specific prompts
- Iterate và refine

## Environment Setup

### Required Environment Variables
```bash
# Google AI API Key (cho Gemini fallback)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# Cursor API Key (optional, cho enhanced features)
CURSOR_API_KEY=your_cursor_api_key

# MCP Server URL
MCP_BASE_URL=http://localhost:8000/mcp
```

### Cài đặt Dependencies
```bash
npm install @google/generative-ai
```

## Use Cases

### 1. **Development Workflow**
- Code review trước khi commit
- Generate boilerplate code
- Debug production issues

### 2. **Learning & Training**
- Hiểu Gravitino best practices
- Learn từ code examples
- Improve coding skills

### 3. **Documentation**
- Generate code documentation
- Create usage examples
- Build tutorials

### 4. **Quality Assurance**
- Automated code analysis
- Security vulnerability detection
- Performance optimization suggestions

## Tips & Tricks

### 1. **Effective Prompts**
```
✅ Good: "Analyze this Gravitino client code for security vulnerabilities and performance issues"

❌ Bad: "Check this code"
```

### 2. **Context Matters**
```
✅ Good: "Generate a function for production Gravitino deployment with error handling, logging, and retry logic"

❌ Bad: "Make a function"
```

### 3. **Iterative Approach**
```
1. Start with analysis
2. Request specific improvements
3. Generate optimized version
4. Test and refine
```

## Integration với Development Workflow

### 1. **Pre-commit Analysis**
```bash
# Trước khi commit, hỏi AI analyze code
"Analyze this commit for Gravitino best practices and potential issues"
```

### 2. **Code Review Assistant**
```bash
# Sử dụng AI để review PR
"Review this Gravitino feature implementation for code quality and best practices"
```

### 3. **Documentation Generation**
```bash
# Tạo docs từ code
"Generate documentation for this Gravitino API client function"
```

## Kết luận

Cursor integration mang lại khả năng AI-powered development cho Gravitino projects, giúp:

- **Tăng productivity** với automated code analysis
- **Improve code quality** với best practices suggestions
- **Faster debugging** với AI-powered diagnosis
- **Better learning** với contextual explanations

Hãy bắt đầu với các suggested questions và explore các tính năng mới!
