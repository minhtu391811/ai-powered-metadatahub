import { NextResponse } from "next/server"
import { getGravitinoClient } from "@/lib/gravitino-client"

export async function GET(request: Request, { params }: { params: { catalog: string; schema: string } }) {
  try {
    const client = getGravitinoClient()
    const tables = await client.listTables(params.catalog, params.schema)
    return NextResponse.json({ tables })
  } catch (error) {
    console.error("[v0] Failed to fetch tables:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch tables from Gravitino API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request, { params }: { params: { catalog: string; schema: string } }) {
  try {
    const body = await request.json()
    const client = getGravitinoClient()
    const table = await client.createTable(params.catalog, params.schema, body)
    return NextResponse.json({ table }, { status: 201 })
  } catch (error) {
    console.error("[v0] Failed to create table:", error)
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 })
  }
}
