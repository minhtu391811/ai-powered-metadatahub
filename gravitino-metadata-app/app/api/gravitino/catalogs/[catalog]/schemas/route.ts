import { NextResponse } from "next/server"
import { getGravitinoClient } from "@/lib/gravitino-client"

export async function GET(request: Request, { params }: { params: { catalog: string } }) {
  try {
    const client = getGravitinoClient()
    const schemas = await client.listSchemas(params.catalog)
    return NextResponse.json({ schemas })
  } catch (error) {
    console.error("[v0] Failed to fetch schemas:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch schemas from Gravitino API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request, { params }: { params: { catalog: string } }) {
  try {
    const body = await request.json()
    const client = getGravitinoClient()
    const schema = await client.createSchema(params.catalog, body)
    return NextResponse.json({ schema }, { status: 201 })
  } catch (error) {
    console.error("[v0] Failed to create schema:", error)
    return NextResponse.json({ error: "Failed to create schema" }, { status: 500 })
  }
}
