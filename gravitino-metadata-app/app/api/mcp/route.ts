import { NextRequest, NextResponse } from 'next/server'

// MCP Proxy Server để bridge giữa web app và Cursor MCP
export async function POST(req: NextRequest) {
  try {
    const { toolName, input } = await req.json()
    
    // Gọi trực tiếp Gravitino API thay vì qua MCP server
    const gravitinoUrl = process.env.GRAVITINO_SERVER_URL || 'http://localhost:8090'
    const metalake = process.env.GRAVITINO_METALAKE || 'metalake_demo'
    
    let result: any = {}
    
    switch (toolName) {
      case 'getListOfCatalogs':
        const catalogsResponse = await fetch(`${gravitinoUrl}/api/metalakes/${metalake}/catalogs`)
        if (catalogsResponse.ok) {
          const catalogs = await catalogsResponse.json()
          result = { catalogs: catalogs || [] }
        } else {
          result = { catalogs: [] }
        }
        break
        
      case 'getListOfSchemas':
        const { catalog } = input
        const schemasResponse = await fetch(`${gravitinoUrl}/api/metalakes/${metalake}/catalogs/${catalog}/schemas`)
        if (schemasResponse.ok) {
          const schemas = await schemasResponse.json()
          result = { schemas: schemas || [] }
        } else {
          result = { schemas: [] }
        }
        break
        
      case 'getListOfTables':
        const { catalog: tableCatalog, schema } = input
        const tablesResponse = await fetch(`${gravitinoUrl}/api/metalakes/${metalake}/catalogs/${tableCatalog}/schemas/${schema}/tables`)
        if (tablesResponse.ok) {
          const tables = await tablesResponse.json()
          result = { tables: tables || [] }
        } else {
          result = { tables: [] }
        }
        break
        
      case 'getTableMetadataDetails':
        const { catalog: detailCatalog, schema: detailSchema, table } = input
        const tableResponse = await fetch(`${gravitinoUrl}/api/metalakes/${metalake}/catalogs/${detailCatalog}/schemas/${detailSchema}/tables/${table}`)
        if (tableResponse.ok) {
          const tableData = await tableResponse.json()
          result = { table: tableData }
        } else {
          result = { table: null }
        }
        break
        
      case 'listOfJobs':
        const jobsResponse = await fetch(`${gravitinoUrl}/api/metalakes/${metalake}/jobs`)
        if (jobsResponse.ok) {
          const jobs = await jobsResponse.json()
          result = { jobs: jobs || [] }
        } else {
          result = { jobs: [] }
        }
        break
        
      case 'listOfJobTemplates':
        const templatesResponse = await fetch(`${gravitinoUrl}/api/metalakes/${metalake}/jobs/templates`)
        if (templatesResponse.ok) {
          const templates = await templatesResponse.json()
          result = { templates: templates || [] }
        } else {
          result = { templates: [] }
        }
        break
        
      case 'listOfTags':
        const tagsResponse = await fetch(`${gravitinoUrl}/api/metalakes/${metalake}/tags`)
        if (tagsResponse.ok) {
          const tags = await tagsResponse.json()
          result = { tags: tags || [] }
        } else {
          result = { tags: [] }
        }
        break
        
      case 'getListOfPolicies':
        const policiesResponse = await fetch(`${gravitinoUrl}/api/metalakes/${metalake}/policies`)
        if (policiesResponse.ok) {
          const policies = await policiesResponse.json()
          result = { policies: policies || [] }
        } else {
          result = { policies: [] }
        }
        break
        
      default:
        result = { error: `Unknown tool: ${toolName}` }
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('MCP Proxy Error:', error)
    return NextResponse.json(
      { error: 'Failed to execute MCP tool' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  try {
    const gravitinoUrl = process.env.GRAVITINO_SERVER_URL || 'http://localhost:8090'
    const metalake = process.env.GRAVITINO_METALAKE || 'metalake_demo'
    
    // Test connection to Gravitino
    const response = await fetch(`${gravitinoUrl}/api/metalakes`)
    const isConnected = response.ok
    
    return NextResponse.json({
      status: isConnected ? 'connected' : 'disconnected',
      gravitinoUrl,
      metalake,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}
