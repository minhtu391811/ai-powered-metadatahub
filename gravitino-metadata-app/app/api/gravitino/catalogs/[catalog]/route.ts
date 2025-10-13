import { NextResponse } from "next/server"
import { getGravitinoClient } from "@/lib/gravitino-client"

export async function GET(request: Request, { params }: { params: { catalog: string } }) {
  try {
    const client = getGravitinoClient()
    const catalog = await client.getCatalog(params.catalog)
    return NextResponse.json({ catalog })
  } catch (error) {
    console.error("[v0] Failed to fetch catalog:", error)
    return NextResponse.json({ error: "Catalog not found" }, { status: 404 })
  }
}

export async function PUT(request: Request, { params }: { params: { catalog: string } }) {
  try {
    const body = await request.json()
    const client = getGravitinoClient()
    const catalog = await client.updateCatalog(params.catalog, body)
    return NextResponse.json({ catalog })
  } catch (error) {
    console.error("[v0] Failed to update catalog:", error)
    return NextResponse.json({ error: "Failed to update catalog" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { catalog: string } }) {
  try {
    const client = getGravitinoClient()
    await client.deleteCatalog(params.catalog)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to delete catalog:", error)
    return NextResponse.json({ error: "Failed to delete catalog" }, { status: 500 })
  }
}
