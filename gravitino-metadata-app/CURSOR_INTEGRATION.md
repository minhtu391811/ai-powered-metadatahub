# Kết nối Web App với Cursor

## 1. Cursor MCP Server Integration

### Cài đặt Cursor MCP Server
```bash
# Cài đặt Cursor MCP server
npm install -g @cursor/mcp-server

# Hoặc sử dụng local installation
npm install @cursor/mcp-server
```

### Cấu hình MCP Server
Tạo file `cursor-mcp-config.json`:
```json
{
  "mcpServers": {
    "cursor": {
      "command": "npx",
      "args": ["@cursor/mcp-server"],
      "env": {
        "CURSOR_API_KEY": "your_cursor_api_key"
      }
    }
  }
}
```

### Kết nối từ Web App
Cập nhật `/app/api/chat/mcpTools.ts`:
```typescript
// Thêm Cursor MCP tools
export const cursorCodeAnalysisTool = tool({
  description: "Analyze code using Cursor AI",
  inputSchema: z.object({
    code: z.string().describe("Code to analyze"),
    language: z.string().describe("Programming language"),
  }),
  execute: async ({ code, language }) => {
    return await callMCP<{ code: string; language: string }, { analysis: string; suggestions: string[] }>(
      "cursor/analyze_code",
      { code, language }
    )
  },
})

export const cursorCodeGenerationTool = tool({
  description: "Generate code using Cursor AI",
  inputSchema: z.object({
    prompt: z.string().describe("Code generation prompt"),
    language: z.string().describe("Target programming language"),
  }),
  execute: async ({ prompt, language }) => {
    return await callMCP<{ prompt: string; language: string }, { code: string; explanation: string }>(
      "cursor/generate_code",
      { prompt, language }
    )
  },
})
```

## 2. Cursor API Integration

### Sử dụng Cursor API trực tiếp
```typescript
// /app/api/chat/cursor.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function callCursorAPI(prompt: string, context?: string) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `You are Cursor AI assistant. ${context || ''}`
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}
```

### Tích hợp vào Chat API
```typescript
// /app/api/chat/route.ts
import { callCursorAPI } from './cursor'

export async function POST(req: Request) {
  const { messages, useCursor } = await req.json()
  
  if (useCursor) {
    // Sử dụng Cursor API
    const response = await callCursorAPI(messages[messages.length - 1].content)
    return new Response(JSON.stringify({ response }))
  }
  
  // Sử dụng Gemini thông thường
  // ... existing code
}
```

## 3. WebSocket Connection

### Tạo WebSocket server cho real-time communication
```typescript
// /app/api/websocket/route.ts
import { NextRequest } from 'next/server'
import { WebSocketServer } from 'ws'

export async function GET(req: NextRequest) {
  const wss = new WebSocketServer({ port: 8080 })
  
  wss.on('connection', (ws) => {
    ws.on('message', async (data) => {
      const { type, payload } = JSON.parse(data.toString())
      
      if (type === 'cursor_query') {
        // Gửi query tới Cursor
        const response = await callCursorAPI(payload.prompt, payload.context)
        ws.send(JSON.stringify({ type: 'cursor_response', data: response }))
      }
    })
  })
}
```

## 4. Cursor Extension Integration

### Tạo Cursor Extension
```typescript
// cursor-extension/src/extension.ts
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  // Tạo command để gửi code tới web app
  const disposable = vscode.commands.registerCommand('cursor.sendToWeb', async () => {
    const editor = vscode.window.activeTextEditor
    if (editor) {
      const code = editor.document.getText()
      const language = editor.document.languageId
      
      // Gửi tới web app
      await fetch('http://localhost:3000/api/cursor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      })
    }
  })
  
  context.subscriptions.push(disposable)
}
```

## 5. Implementation Example

### Frontend Integration
```typescript
// /app/dashboard/ai-assistant/page.tsx
const [useCursor, setUseCursor] = useState(false)

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const input = inputRef.current?.value
  
  if (input?.trim()) {
    sendMessage({ 
      text: input,
      useCursor: useCursor // Flag để sử dụng Cursor
    })
  }
}

// Thêm toggle cho Cursor
<div className="flex items-center gap-2 mb-4">
  <input 
    type="checkbox" 
    id="use-cursor"
    checked={useCursor}
    onChange={(e) => setUseCursor(e.target.checked)}
  />
  <label htmlFor="use-cursor">Use Cursor AI</label>
</div>
```

### Backend API Update
```typescript
// /app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages, useCursor } = await req.json()
  
  if (useCursor) {
    // Sử dụng Cursor với context từ Gravitino
    const context = "You are helping with Apache Gravitino metadata management. "
    const response = await callCursorAPI(messages[messages.length - 1].content, context)
    
    return new Response(JSON.stringify({
      messages: [...messages, { role: 'assistant', content: response }]
    }))
  }
  
  // Existing Gemini implementation
  // ...
}
```

## 6. Advanced Features

### Code Analysis với Gravitino Context
```typescript
export const analyzeGravitinoCodeTool = tool({
  description: "Analyze Gravitino-related code using Cursor AI",
  inputSchema: z.object({
    code: z.string(),
    context: z.string().optional(),
  }),
  execute: async ({ code, context }) => {
    const prompt = `
    Analyze this Gravitino-related code:
    ${code}
    
    Context: ${context || 'Apache Gravitino metadata management'}
    
    Provide:
    1. Code analysis
    2. Potential issues
    3. Best practices for Gravitino
    4. Optimization suggestions
    `
    
    return await callCursorAPI(prompt, "Gravitino expert")
  },
})
```

### Real-time Code Suggestions
```typescript
// WebSocket cho real-time suggestions
const ws = new WebSocket('ws://localhost:8080')

ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data)
  if (type === 'cursor_suggestion') {
    // Hiển thị suggestion trong UI
    showSuggestion(data)
  }
}
```

## 7. Environment Setup

### Required Environment Variables
```bash
# .env.local
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
CURSOR_API_KEY=your_cursor_api_key
CURSOR_MCP_SERVER_URL=http://localhost:8000/cursor
```

### Package Dependencies
```bash
npm install @google/generative-ai
npm install ws
npm install @types/ws
```

## 8. Benefits

- **Real-time Code Analysis**: Phân tích code Gravitino trực tiếp
- **Context-aware Suggestions**: Gợi ý dựa trên Gravitino best practices
- **Seamless Integration**: Tích hợp mượt mà với existing workflow
- **Enhanced Productivity**: Tăng hiệu suất development
- **AI-powered Debugging**: Debug với AI assistance

## 9. Use Cases

1. **Code Review**: Tự động review Gravitino code
2. **Documentation Generation**: Tạo docs từ code
3. **Bug Detection**: Tìm lỗi trong metadata handling
4. **Performance Optimization**: Tối ưu hóa queries
5. **Best Practices**: Đảm bảo tuân thủ Gravitino patterns
