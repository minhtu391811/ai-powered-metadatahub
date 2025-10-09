"use client"

import { useState, useMemo } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Database, MoreVertical, Calendar, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import useSWR from "swr"
import { getGravitinoClient } from "@/lib/gravitino-client"

const fetcher = async () => {
  console.log("[v0] Dashboard: Starting to fetch catalogs")
  const client = getGravitinoClient()
  // Lấy danh sách catalogs
  const catalogNames = await client.listCatalogs()
  const catalogs = await Promise.all(catalogNames.map(name => client.getCatalog(name)))
  // Chỉ giữ catalog đang in-use
  const activeCatalogs = catalogs.filter(
    (cat) => cat.properties?.["in-use"] === "true"
  )
  // Lấy schemas và tables
  const schemasArray = await Promise.all(
    activeCatalogs.map(async (cat) => {
      try {
        const schemaNames = await client.listSchemas(cat.name)
        const schemaList = await Promise.all(schemaNames.map((name) => client.getSchema(cat.name, name)))
        // Lấy danh sách tables trong từng schema
        const schemaWithTables = await Promise.all(
          schemaList.map(async (schema) => {
            if (schema.name === "default") {
              console.log(`[v0] Skip tables for [${schema.name}] in [${cat.name}]`)
              return { ...schema, tables: [] }
            }
            try {
              const tableNames = await client.listTables(cat.name, schema.name)
              const tableList = await Promise.all(tableNames.map((name: string) => client.getTable(cat.name, schema.name, name)))
              return { ...schema, tables: tableList }
            } catch (err) {
              console.warn(
                `[v0] Skip tables for schema [${schema.name}] in catalog [${cat.name}] — ${(err as any).message}`
              )
              return { ...schema, tables: [] }
            }
          })
        )

        return { name: cat.name, schemaList: schemaWithTables }
      } catch (err) {
        console.warn(`[v0] Failed to fetch schemas for catalog [${cat.name}]: ${(err as Error).message}`)
        return { name: cat.name, schemaList: [] }
      }
    })
  )
  // Dạng object để dễ lookup
  const schemas: Record<string, any[]> = Object.fromEntries(
    schemasArray.map(({ name, schemaList }) => [name, schemaList])
  )
  // Gom tables nếu cần tổng hợp
  const tables: Record<string, any[]> = {}
  for (const [catalogName, schemaList] of Object.entries(schemas)) {
    tables[catalogName] = schemaList.flatMap((schema) => schema.tables || [])
  }

  console.log("[v0] Dashboard: Successfully fetched active catalogs:", activeCatalogs.length)
  return { catalogs, schemas, tables }
}

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR("catalogs", fetcher, {
    refreshInterval: 30000,
  })

  const [selectedCatalog, setSelectedCatalog] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("");
  const catalogs = data?.catalogs || []
  const schemas = data?.schemas || {}
  const tables = data?.tables || {}

  // Lọc theo từ khóa tìm kiếm
  const filteredCatalogs = useMemo(() => {
    if (!searchQuery) return catalogs;
    const query = searchQuery.toLowerCase();

    return catalogs.filter((cat: any) =>
      cat.name?.toLowerCase().includes(query) ||
      cat.type?.toLowerCase().includes(query) ||
      cat.provider?.toLowerCase().includes(query)
    );
  }, [catalogs, searchQuery]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Catalogs</h1>
              <p className="text-muted-foreground">Manage your metadata catalogs and data sources</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to connect to Gravitino API</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Catalogs</CardTitle>
              <CardDescription>Find catalogs by name</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search catalogs..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading catalogs...</p>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Catalogs</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{catalogs.length}</div>
                    <p className="text-xs text-muted-foreground">Across all environments</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Schemas</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {catalogs
                        .reduce((acc, cat) => acc + (schemas[cat.name]?.length || 0), 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Organized data structures</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Object.values(tables).reduce((acc, list) => acc + list.length, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Managed data tables</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Catalogs</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {catalogs.filter((cat: any) => cat.properties?.["in-use"] === "true").length}
                    </div>
                    <p className="text-xs text-muted-foreground">Currently operational</p>
                  </CardContent>
                </Card>
              </div>

              {/* Catalog Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {catalogs.map((catalog: any) => (
                  <Card key={catalog.name} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Database className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{catalog.name}</CardTitle>
                            <CardDescription className="text-xs">{catalog.provider || catalog.type}</CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedCatalog(catalog)}>
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="secondary">{catalog.type}</Badge>
                      </div>
                      {catalog.comment && (
                        <p className="text-xs text-muted-foreground pt-2 border-t">{catalog.comment}</p>
                      )}
                      {catalog.audit?.createTime && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                          <Calendar className="h-3 w-3" />
                          Created {new Date(catalog.audit.createTime).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {catalogs.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Database className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No catalogs found</h3>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Catalog Details Dialog */}
        <Dialog open={!!selectedCatalog} onOpenChange={() => setSelectedCatalog(null)}>
          {selectedCatalog && (
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Catalog Details: {selectedCatalog.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <p><strong>Type:</strong> {selectedCatalog.type}</p>
                <p><strong>Provider:</strong> {selectedCatalog.provider}</p>
                {selectedCatalog.comment && <p><strong>Comment:</strong> {selectedCatalog.comment}</p>}

                {selectedCatalog.properties && (
                  <div>
                    <strong>Properties:</strong>
                    <ul className="list-disc list-inside">
                      {Object.entries(selectedCatalog.properties).map(([key, value]) => (
                        <li key={key}><span className="font-medium">{key}</span>: {String(value)}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCatalog.audit && (
                  <div className="border-t pt-2 mt-2 text-xs text-muted-foreground">
                    <p><strong>Created by:</strong> {selectedCatalog.audit.creator}</p>
                    <p><strong>Created at:</strong> {new Date(selectedCatalog.audit.createTime).toLocaleString()}</p>
                    {selectedCatalog.audit.lastModifier && (
                      <p><strong>Last modified by:</strong> {selectedCatalog.audit.lastModifier}</p>
                    )}
                    {selectedCatalog.audit.lastModifiedTime && (
                      <p><strong>Last modified at:</strong> {new Date(selectedCatalog.audit.lastModifiedTime).toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          )}
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  )
}