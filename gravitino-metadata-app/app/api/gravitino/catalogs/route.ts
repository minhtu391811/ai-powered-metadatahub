import { NextResponse } from "next/server"
import { getGravitinoClient } from "@/lib/gravitino-client"

export async function GET() {
  try {
    const client = getGravitinoClient()
    const catalogs = await client.listCatalogs()
    return NextResponse.json({ catalogs })
  } catch (error) {
    console.error("[v0] Failed to fetch catalogs:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch catalogs from Gravitino API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const client = getGravitinoClient()
    const catalog = await client.createCatalog(body)
    return NextResponse.json({ catalog }, { status: 201 })
  } catch (error) {
    console.error("[v0] Failed to create catalog:", error)
    return NextResponse.json({ error: "Failed to create catalog" }, { status: 500 })
  }
}
