import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"
import { tools as mcpTools } from "./mcpTools"

export const maxDuration = 30

// Timeout configuration
const CHAT_TIMEOUT = 25000 // 25 seconds

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const prompt = convertToModelMessages(messages)

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT)

    const result = streamText({
    model: "google/gemini-1.5-flash",
    system: `You are a helpful AI assistant powered by Cursor AI with Google Gemini for Apache Gravitino metadata management. 
You can help users explore and manage their Gravitino metadata including:

**Core Metadata:**
- Catalogs: List and explore catalogs in the system
- Schemas: Browse schemas within catalogs
- Tables: View tables and their detailed metadata including columns, types, and properties
- Models: Explore ML models and their versions
- Topics: Manage streaming topics
- Filesets: Handle file-based datasets

**Job Management:**
- Job Templates: List and manage job templates
- Jobs: View job status, run jobs, and cancel running jobs

**Governance:**
- Tags: List and manage metadata tags for organization
- Policies: View and manage access policies
- Statistics: Access metadata statistics and partition information

**Available Tools:**
You have access to comprehensive MCP tools through Cursor's MCP server that connect directly to the Gravitino server. Use these tools to:
- getListOfCatalogs: Get all available catalogs
- getListOfSchemas: Get schemas in a specific catalog
- getListOfTables: Get tables in a catalog.schema
- getTableMetadataDetails: Get detailed table schema information
- listOfJobs: List all jobs
- listOfJobTemplates: List job templates
- listOfTags: List all tags
- getListOfPolicies: List all policies
- And many more specialized tools for models, topics, filesets, etc.

**Cursor MCP Integration:**
You are running within Cursor's environment with access to Gravitino MCP server. This means:
- You have real-time access to Gravitino metadata through Cursor's MCP server
- You can perform live queries and operations on the Gravitino system
- You understand the current state of the Gravitino system
- You can provide context-aware responses based on actual data from the MCP server

**Guidelines:**
- Always use the appropriate tools to get real-time data from the Gravitino server
- Be proactive in suggesting related queries when users ask about metadata
- Provide clear, structured responses with the data you retrieve
- If a user asks about specific metadata, use the tools to get the actual current data
- When showing results, format them in a user-friendly way
- Always be helpful and guide users to explore their metadata effectively`,
    messages: prompt,
    tools: mcpTools,
    abortSignal: controller.signal,
  })

    return result.toUIMessageStreamResponse({
      onFinish: async ({ isAborted }) => {
        clearTimeout(timeoutId)
        if (isAborted) {
          console.log("[v0] Chat request aborted or timed out")
        }
      },
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({ 
        error: "Chat request failed", 
        message: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}
