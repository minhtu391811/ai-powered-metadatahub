"use client"

import { useState, useMemo } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "@/components/ui/dropdown-menu"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import useSWR from "swr"
import { getGravitinoClient } from "@/lib/gravitino-client"

const fetcher = async () => {
  console.log("[v0] Schemas: Starting to fetch catalogs & schemas")
  const client = getGravitinoClient()
  const catalogNames = await client.listCatalogs()
  const catalogs = await Promise.all(catalogNames.map((name) => client.getCatalog(name)))
  const activeCatalogs = catalogs.filter(
    (cat) => cat.properties?.["in-use"] === "true"
  )
  const schemasArray = await Promise.all(
    activeCatalogs.map(async (cat) => {
      try {
        const schemaNames = await client.listSchemas(cat.name)
        const schemaList = await Promise.all(schemaNames.map((name) => client.getSchema(cat.name, name)))
        return { name: cat.name, schemaList }
      } catch (err) {
        console.warn(`[v0] Schemas: Failed to fetch schemas for ${cat.name}`, err)
        return { name: cat.name, schemaList: [] }
      }
    })
  )
  const schemas: Record<string, any[]> = Object.fromEntries(
    schemasArray.map(({ name, schemaList }) => [name, schemaList])
  )

  console.log(
    `[v0] Schemas: Fetched ${catalogs.length} catalogs, ${Object.values(schemas).reduce(
      (acc, list) => acc + list.length,
      0
    )} schemas total`
  )

  return { catalogs, schemas }
}

export default function SchemasPage() {
  const { data, error, isLoading } = useSWR("schemas-dashboard", fetcher, {
    refreshInterval: 30000,
  })

  const catalogs = data?.catalogs || []
  const schemas = data?.schemas || {}
  const [selectedSchema, setSelectedSchema] = useState<any | null>(null)

  const [searchQuery, setSearchQuery] = useState("")

  // Lọc theo từ khóa tìm kiếm
  const filteredSchemas = useMemo(() => {
    if (!searchQuery) return schemas

    const query = searchQuery.toLowerCase()
    const result: Record<string, any[]> = {}

    Object.entries(schemas).forEach(([catalogName, schemaList]) => {
      const matchedSchemas = schemaList.filter((schema: any) => {
        const fullName = `${catalogName}.${schema.name}`.toLowerCase()
        return (
          catalogName.toLowerCase().includes(query) ||
          schema.name.toLowerCase().includes(query) ||
          fullName.includes(query)
        )
      })
      if (matchedSchemas.length > 0) {
        result[catalogName] = matchedSchemas
      }
    })

    return result
  }, [schemas, searchQuery])


  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Schemas</h1>
              <p className="text-muted-foreground">
                Manage logical groupings of tables across active catalogs.
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load schemas from Gravitino API. Please check your connection.
              </AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Schemas</CardTitle>
              <CardDescription>Find schemas by catalog, or name</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schemas..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading schemas...</p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Schemas Overview</CardTitle>
                <CardDescription>
                  Found{" "}
                  {Object.values(schemas).reduce(
                    (acc, list) => acc + list.length,
                    0
                  )}{" "}
                  schemas across{" "}
                  {catalogs.filter((c: any) => c.properties?.["in-use"] === "true")
                    .length}{" "}
                  active catalogs
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {Object.entries(filteredSchemas).map(([catalogName, schemaList]) => (
                  <div key={catalogName}>
                    <h3 className="font-semibold text-lg mb-2">{catalogName}</h3>
                    {schemaList.length > 0 ? (
                      <div className="grid gap-2">
                        {schemaList.map((schema: any) => (
                          <div
                            key={schema.name}
                            className="flex items-center justify-between rounded border p-3 hover:bg-muted/40 transition"
                          >
                            <div>
                              <p className="font-medium">{schema.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {schema.comment || "No description"}
                              </p>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => setSelectedSchema(schema)}
                                >
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground ml-2">
                        No schemas found.
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* --- Schema Details Modal --- */}
          {selectedSchema && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-background rounded-2xl shadow-xl p-6 max-w-lg w-full">
                <h2 className="text-xl font-bold mb-4">
                  Schema: {selectedSchema.name}
                </h2>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {Object.entries(selectedSchema).map(([key, value]) => (
                    <div key={key} className="mb-2">
                      {typeof value === "object" && value !== null ? (
                        <div className="text-sm">
                          <span className="font-medium">{key}:</span>
                          <div className="ml-4 mt-1 space-y-1">
                            {Object.entries(value).map(([subKey, subValue]) => (
                              <div key={subKey} className="flex justify-between">
                                <span className="text-muted-foreground">{subKey}</span>
                                <span className="text-right break-all ml-2">
                                  {typeof subValue === "object"
                                    ? JSON.stringify(subValue, null, 2)
                                    : String(subValue)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{key}</span>
                          <span className="text-muted-foreground break-all text-right ml-2">
                            {String(value)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-right">
                  <Button onClick={() => setSelectedSchema(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}