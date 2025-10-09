import { NextResponse } from "next/server"
import { getGravitinoClient } from "@/lib/gravitino-client"

export async function GET(
  request: Request,
  { params }: { params: { catalog: string; schema: string; table: string } },
) {
  try {
    const client = getGravitinoClient()
    const table = await client.getTable(params.catalog, params.schema, params.table)
    return NextResponse.json({ table })
  } catch (error) {
    console.error("[v0] Failed to fetch table:", error)
    return NextResponse.json({ error: "Table not found" }, { status: 404 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { catalog: string; schema: string; table: string } },
) {
  try {
    const client = getGravitinoClient()
    await client.deleteTable(params.catalog, params.schema, params.table)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to delete table:", error)
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 })
  }
}
