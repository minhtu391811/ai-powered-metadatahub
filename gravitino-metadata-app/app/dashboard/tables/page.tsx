"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle, Eye } from "lucide-react"
import { useState, useMemo } from "react"
import useSWR from "swr"
import { getGravitinoClient } from "@/lib/gravitino-client"

const fetcher = async () => {
  console.log("[v0] TablesPage: Starting to fetch catalogs")
  const client = getGravitinoClient()
  // Lấy danh sách catalog
  const names = await client.listCatalogs()
  const catalogs = await Promise.all(names.map((name: string) => client.getCatalog(name)))
  // Lọc catalog đang hoạt động
  const activeCatalogs = catalogs.filter(
    (cat) => cat.properties?.["in-use"] === "true"
  )
  // Lấy schemas và tables
  const schemasArray = await Promise.all(
    activeCatalogs.map(async (cat) => {
      try {
        const schemaNames = await client.listSchemas(cat.name)
        const schemaList = await Promise.all(schemaNames.map((name: string) => client.getSchema(cat.name, name)))
        const schemaWithTables = await Promise.all(
          schemaList.map(async (schema) => {
            // Không lấy bảng nếu là default
            if (schema.name === "default") {
              console.log(`[v0] Skip tables for ${cat.name}.${schema.name}`)
              return { ...schema, tables: [] }
            }

            try {
              const tableNames = await client.listTables(cat.name, schema.name)
              const tableList = await Promise.all(tableNames.map((name: string) => client.getTable(cat.name, schema.name, name)))
              const detailedTables = await Promise.all(
                tableList.map(async (table: any) => {
                  const tableName = typeof table === "string" ? table : table.name
                  try {
                    const tableDetails = await client.getTable(cat.name, schema.name, tableName)
                    return tableDetails
                  } catch (err) {
                    console.warn(`[v0] Failed to fetch details for ${cat.name}.${schema.name}.${tableName}`)
                    return { name: tableName }
                  }
                })
              )
              return { ...schema, tables: detailedTables }
            } catch (err: any) {
              console.warn(
                `[v0] Failed to fetch tables for ${cat.name}.${schema.name}: ${err.message}`
              )
              return { ...schema, tables: [] }
            }
          })
        )

        return { name: cat.name, schemaList: schemaWithTables }
      } catch (err: any) {
        console.warn(`[v0] Failed to fetch schemas for catalog ${cat.name}: ${err.message}`)
        return { name: cat.name, schemaList: [] }
      }
    })
  )

  const schemas: Record<string, any[]> = Object.fromEntries(
    schemasArray.map(({ name, schemaList }) => [name, schemaList])
  )

  // Gom toàn bộ bảng
  const tables: any[] = []
  for (const [catalogName, schemaList] of Object.entries(schemas)) {
    for (const schema of schemaList) {
      for (const table of schema.tables || []) {
        tables.push({
          ...table,
          catalog: catalogName,
          schema: schema.name,
        })
      }
    }
  }

  console.log("[v0] TablesPage: Successfully fetched tables:", tables.length)
  return { catalogs, schemas, tables }
}

export default function TablesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTable, setSelectedTable] = useState<any | null>(null)

  const { data, error, isLoading } = useSWR("/api/gravitino/tables", fetcher, {
    refreshInterval: 30000,
  })

  const tables = data?.tables || []

  // Lọc theo từ khóa tìm kiếm
  const filteredTables = useMemo(() => {
    if (!searchQuery) return tables
    const query = searchQuery.toLowerCase()

    return tables.filter((table: any) => {
      const fullName = `${table.catalog}.${table.schema}.${table.name}`.toLowerCase()
      return (
        table.name?.toLowerCase().includes(query) ||
        table.catalog?.toLowerCase().includes(query) ||
        table.schema?.toLowerCase().includes(query) ||
        fullName.includes(query)
      )
    })
  }, [tables, searchQuery])

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
              <p className="text-muted-foreground">Browse and manage all tables across catalogs</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load data from Gravitino API. Please check your connection.
              </AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Tables</CardTitle>
              <CardDescription>Find tables by catalog, schema or name</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tables..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading tables...</p>
            </div>
          )}

          {/* Tables Overview */}
          {!isLoading && !error && (
            <Card>
              <CardHeader>
                <CardTitle>Tables Overview</CardTitle>
                <CardDescription>
                  Found {tables.length} table{tables.length !== 1 ? "s" : ""} across{" "}
                  {data?.catalogs?.length || 0} catalog
                  {data?.catalogs?.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data?.schemas && Object.keys(data.schemas).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(data.schemas).map(([catalogName, schemaList]: [string, any[]]) => (
                      <div key={catalogName} className="border rounded-lg p-4">
                        {/* Catalog */}
                        <h2 className="text-xl font-bold mb-3">{catalogName}</h2>

                        {schemaList.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No schemas found.</p>
                        ) : (
                          schemaList.map((schema) => (
                            <div key={schema.name} className="ml-4 mb-4">
                              {/* Schema */}
                              <h3 className="font-semibold text-lg mb-2">
                                Schema: <span className="text-muted-foreground">{schema.name}</span>
                              </h3>

                              {schema.tables?.length > 0 ? (
                                <ul className="divide-y divide-border text-sm">
                                  {schema.tables
                                    .filter((t: any) =>
                                      `${t.catalog}.${t.schema}.${t.name}`
                                        .toLowerCase()
                                        .includes(searchQuery.toLowerCase())
                                    )
                                    .map((table: any) => (
                                      <li
                                        key={`${catalogName}.${schema.name}.${table.name}`}
                                        className="py-2 flex items-center justify-between"
                                      >
                                        <div>
                                          <span className="font-medium">{table.name}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setSelectedTable(table)}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </li>
                                    ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground ml-2">
                                  No tables in this schema.
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No catalogs or schemas found.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {selectedTable && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-background rounded-2xl shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">
                  Table: {selectedTable.name}
                </h2>

                {/* Tổng quan */}
                <div className="space-y-1 mb-4 text-sm">
                  <p><strong>Catalog:</strong> {selectedTable.catalog}</p>
                  <p><strong>Schema:</strong> {selectedTable.schema}</p>
                  <p><strong>Comment:</strong> {selectedTable.comment || "No comment"}</p>
                </div>

                {/* Sơ đồ bảng */}
                {selectedTable.columns?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Table Schema</h3>
                    <div className="border rounded-lg divide-y">
                      {selectedTable.columns.map((col: any) => (
                        <div key={col.name} className="flex justify-between p-2 text-sm">
                          <span className="font-medium">{col.name}</span>
                          <span className="text-muted-foreground">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Properties */}
                {selectedTable.properties && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Properties</h3>
                    <div className="text-sm space-y-1">
                      {Object.entries(selectedTable.properties).map(([key, val]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="text-right break-all ml-2">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audit info */}
                {selectedTable.audit && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Audit Info</h3>
                    <div className="text-sm space-y-1">
                      {Object.entries(selectedTable.audit).map(([key, val]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="text-right break-all ml-2">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 text-right">
                  <Button onClick={() => setSelectedTable(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}