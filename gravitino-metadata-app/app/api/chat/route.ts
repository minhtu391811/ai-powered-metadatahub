import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"
import { tools as mcpTools } from "./mcpTools"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: `You are a helpful AI assistant for Apache Gravitino metadata management. 
You can help users explore catalogs, schemas, and tables in their Gravitino instance.
You have access to tools that connect to the Gravitino MCP server to retrieve metadata information.
Always be concise and helpful in your responses.`,
    messages: prompt,
    tools: mcpTools,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("[v0] Chat request aborted")
      }
    },
    consumeSseStream: consumeStream,
  })
}
