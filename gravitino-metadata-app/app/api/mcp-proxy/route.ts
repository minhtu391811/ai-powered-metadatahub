import { NextRequest, NextResponse } from 'next/server'
import { initializeMCPSession, getMCPSessionId } from '@/lib/mcp-session'

// MCP Proxy để bypass CORS issues
export async function POST(req: NextRequest) {
  try {
    const { toolName, input } = await req.json()
    
    const mcpUrl = process.env.MCP_BASE_URL || 'http://localhost:8000/mcp/'
    
    // Ensure MCP session is initialized
    const sessionId = await initializeMCPSession()
    
    // Create MCP request for Docker server with proper JSON-RPC format
    const mcpRequest = {
      jsonrpc: "2.0",
      id: Date.now().toString(),
      method: toolName,
      params: input || {}
    }
    
    console.log(`Proxying MCP request: ${toolName}`, mcpRequest)
    
    const response = await fetch(mcpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify(mcpRequest),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`MCP tool ${toolName} failed:`, response.status, response.statusText, errorText)
      return NextResponse.json(
        { error: `MCP tool ${toolName} failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log(`MCP tool ${toolName} success:`, data)
    
    // Handle JSON-RPC response
    if (data.error) {
      console.error(`MCP tool ${toolName} error:`, data.error)
      return NextResponse.json(
        { error: data.error.message || 'MCP tool execution failed' },
        { status: 500 }
      )
    }
    
    // Return the result from JSON-RPC response
    return NextResponse.json(data.result || data)
    
  } catch (error) {
    console.error('MCP Proxy Error:', error)
    return NextResponse.json(
      { error: 'Failed to execute MCP tool' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Health check endpoint
export async function GET() {
  try {
    const mcpUrl = process.env.MCP_BASE_URL || 'http://localhost:8000/mcp/'
    
    // Try to initialize MCP session to test connection
    try {
      const sessionId = await initializeMCPSession()
      
      return NextResponse.json({
        status: 'connected',
        mcpUrl,
        sessionId,
        timestamp: new Date().toISOString()
      })
    } catch (initError) {
      return NextResponse.json({
        status: 'disconnected',
        error: `MCP initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`,
        mcpUrl,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    return NextResponse.json({
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}
