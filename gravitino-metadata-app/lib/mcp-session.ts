// MCP Session Management
let mcpSession: { sessionId?: string; initialized: boolean } = {
  initialized: false
}

export async function initializeMCPSession(): Promise<string> {
  if (mcpSession.initialized && mcpSession.sessionId) {
    return mcpSession.sessionId
  }

  const mcpUrl = process.env.MCP_BASE_URL || 'http://localhost:8000/mcp/'
  
  try {
    // Initialize MCP session
    const initRequest = {
      jsonrpc: "2.0",
      id: "init-" + Date.now(),
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "gravitino-web-app",
          version: "1.0.0"
        }
      }
    }

    const response = await fetch(mcpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify(initRequest),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      throw new Error(`MCP initialization failed: ${response.status}`)
    }

    const data = await response.json()
    if (data.error) {
      throw new Error(`MCP initialization error: ${data.error.message}`)
    }

    // Generate a session ID for this connection
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    mcpSession = {
      sessionId,
      initialized: true
    }

    console.log('MCP session initialized:', sessionId)
    return sessionId

  } catch (error) {
    console.error('Failed to initialize MCP session:', error)
    throw error
  }
}

export function getMCPSessionId(): string | undefined {
  return mcpSession.sessionId
}

export function isMCPInitialized(): boolean {
  return mcpSession.initialized
}

export function resetMCPSession() {
  mcpSession = {
    initialized: false
  }
}
