"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Loader2, Wifi, WifiOff, CheckCircle, AlertCircle } from "lucide-react"
import { useRef, useEffect, useState } from "react"

// Helper function to render tool output in a user-friendly way
function renderToolOutput(toolName: string, output: any) {
  if (!output) return <div className="text-muted-foreground">No data available</div>

  switch (toolName) {
    case "tool-getListOfCatalogs":
      if (output.catalogs && Array.isArray(output.catalogs)) {
        return (
          <div className="space-y-2">
            <div className="font-medium">Available Catalogs:</div>
            <div className="grid gap-2">
              {output.catalogs.map((catalog: any, index: number) => (
                <div key={index} className="p-2 bg-background rounded border">
                  <div className="font-medium">{catalog.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Type: {catalog.type} • Schemas: {catalog.schemas} • Tables: {catalog.tables}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }
      break

    case "tool-getListOfSchemas":
      if (output.schemas && Array.isArray(output.schemas)) {
        return (
          <div className="space-y-2">
            <div className="font-medium">Schemas in {output.catalog}:</div>
            <div className="grid gap-2">
              {output.schemas.map((schema: any, index: number) => (
                <div key={index} className="p-2 bg-background rounded border">
                  <div className="font-medium">{schema.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Tables: {schema.tables} {schema.views ? `• Views: ${schema.views}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }
      break

    case "tool-getListOfTables":
      if (output.tables && Array.isArray(output.tables)) {
        return (
          <div className="space-y-2">
            <div className="font-medium">Tables in {output.catalog}.{output.schema}:</div>
            <div className="grid gap-1">
              {output.tables.map((table: any, index: number) => (
                <div key={index} className="p-2 bg-background rounded border text-sm">
                  {table.name}
                </div>
              ))}
            </div>
          </div>
        )
      }
      break

    case "tool-getTableMetadataDetails":
      if (output.columns && Array.isArray(output.columns)) {
        return (
          <div className="space-y-3">
            <div className="font-medium">Table: {output.catalog}.{output.schema}.{output.table}</div>
            <div>
              <div className="font-medium mb-2">Columns:</div>
              <div className="space-y-1">
                {output.columns.map((column: any, index: number) => (
                  <div key={index} className="p-2 bg-background rounded border text-sm">
                    <div className="font-medium">{column.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Type: {column.type} • Nullable: {column.nullable ? 'Yes' : 'No'}
                      {column.comment && ` • Comment: ${column.comment}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
      break

    case "tool-listOfJobs":
      if (output.jobs && Array.isArray(output.jobs)) {
        return (
          <div className="space-y-2">
            <div className="font-medium">Available Jobs:</div>
            <div className="grid gap-2">
              {output.jobs.map((job: any, index: number) => (
                <div key={index} className="p-2 bg-background rounded border">
                  <div className="font-medium">{job.name}</div>
                  <div className="text-xs text-muted-foreground">ID: {job.id}</div>
                </div>
              ))}
            </div>
          </div>
        )
      }
      break

    case "tool-listOfJobTemplates":
      if (output.templates && Array.isArray(output.templates)) {
        return (
          <div className="space-y-2">
            <div className="font-medium">Available Job Templates:</div>
            <div className="grid gap-2">
              {output.templates.map((template: any, index: number) => (
                <div key={index} className="p-2 bg-background rounded border">
                  <div className="font-medium">{template.name}</div>
                </div>
              ))}
            </div>
          </div>
        )
      }
      break

    case "tool-listOfTags":
      if (output.tags && Array.isArray(output.tags)) {
        return (
          <div className="space-y-2">
            <div className="font-medium">Available Tags:</div>
            <div className="flex flex-wrap gap-2">
              {output.tags.map((tag: any, index: number) => (
                <Badge key={index} variant="outline">{tag.name}</Badge>
              ))}
            </div>
          </div>
        )
      }
      break

    case "tool-getListOfPolicies":
      if (output.policies && Array.isArray(output.policies)) {
        return (
          <div className="space-y-2">
            <div className="font-medium">Available Policies:</div>
            <div className="grid gap-2">
              {output.policies.map((policy: any, index: number) => (
                <div key={index} className="p-2 bg-background rounded border">
                  <div className="font-medium">{policy.name}</div>
                </div>
              ))}
            </div>
          </div>
        )
      }
      break


    default:
      // Fallback to JSON display for unknown tools
      return (
        <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
          {JSON.stringify(output, null, 2)}
        </pre>
      )
  }

  // Fallback for any other cases
  return (
    <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}

export default function AIAssistantPage() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mcpConnectionStatus, setMcpConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Show timeout warning after 20 seconds
  useEffect(() => {
    if (status && (status as string) !== "idle") {
      const timer = setTimeout(() => {
        setShowTimeoutWarning(true)
      }, 20000) // 20 seconds
      
      return () => clearTimeout(timer)
    } else {
      setShowTimeoutWarning(false)
    }
  }, [status])

  // Check MCP server connection status
  useEffect(() => {
    const checkMcpConnection = async () => {
      try {
        setMcpConnectionStatus('checking')
        const response = await fetch('/api/mcp-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolName: 'getListOfCatalogs', input: {} })
        })
        
        if (response.ok) {
          setMcpConnectionStatus('connected')
        } else {
          setMcpConnectionStatus('disconnected')
        }
      } catch (error) {
        setMcpConnectionStatus('disconnected')
      }
    }

    checkMcpConnection()
    // Check connection every 30 seconds
    const interval = setInterval(checkMcpConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const input = inputRef.current?.value
    if (input?.trim()) {
      sendMessage({ text: input })
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  const suggestedQuestions = [
    "List all catalogs in the system",
    "Show me all available job templates",
    "What tables are available in the system?",
    "List all tags in the metadata",
    "Show me all policies",
    "Get details for a specific table",
    "List all jobs and their status",
    "Show me all models in the system",
    "What's the current state of my Gravitino metadata?",
    "Help me understand the metadata lineage",
    "Show me statistics for my tables",
  ]

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
            <p className="text-muted-foreground">Ask questions about your Gravitino metadata</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chat Interface */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Gravitino AI Assistant
                </CardTitle>
                <CardDescription>Powered by Cursor AI + Google Gemini • Connected to Gravitino MCP Server</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages */}
                <div className="h-[500px] overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
                  {messages.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <Bot className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium">Welcome to Gravitino AI Assistant</p>
                        <p className="text-sm text-muted-foreground">
                          Powered by Cursor AI + Google Gemini • Ask me anything about your metadata catalogs, schemas, and tables
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <AlertCircle className="h-12 w-12 text-red-500" />
                      <div>
                        <p className="text-lg font-medium text-red-600">Connection Error</p>
                        <p className="text-sm text-muted-foreground">
                          {error.message || "Failed to connect to AI service. Please try again."}
                        </p>
                        <button 
                          onClick={() => window.location.reload()} 
                          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border border-border"
                        }`}
                      >
                        {message.parts.map((part, index) => {
                          switch (part.type) {
                            case "text":
                              return (
                                <div key={index} className="whitespace-pre-wrap text-sm">
                                  {part.text}
                                </div>
                              )

                            case "tool-getListOfCatalogs":
                            case "tool-getListOfSchemas":
                            case "tool-getListOfTables":
                            case "tool-getTableMetadataDetails":
                            case "tool-listOfModels":
                            case "tool-loadModel":
                            case "tool-listModelVersions":
                            case "tool-loadModelVersion":
                            case "tool-loadModelVersionByAlias":
                            case "tool-listOfTopics":
                            case "tool-loadTopic":
                            case "tool-listOfFilesets":
                            case "tool-loadFileset":
                            case "tool-listFilesInFileset":
                            case "tool-listOfJobs":
                            case "tool-getJobById":
                            case "tool-listOfJobTemplates":
                            case "tool-getJobTemplateByName":
                            case "tool-runJob":
                            case "tool-cancelJob":
                            case "tool-getTagByName":
                            case "tool-listOfTags":
                            case "tool-listTagsForMetadata":
                            case "tool-listMetadataByTag":
                            case "tool-associateTagWithMetadata":
                            case "tool-disassociateTagFromMetadata":
                            case "tool-listStatisticsForMetadata":
                            case "tool-listStatisticsForPartition":
                            case "tool-getListOfPolicies":
                            case "tool-getPolicyDetailInformation":
                            case "tool-listPoliciesForMetadata":
                            case "tool-listMetadataByPolicy":
                            case "tool-getPolicyForMetadata":
                            case "tool-metadataTypeToFullnameFormats":
                              if (part.state === "output-available") {
                                return (
                                  <div key={index} className="mt-3 p-3 bg-muted/50 rounded-lg border">
                                    <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {(part as any).toolName?.replace('tool-', '') || 'Unknown Tool'}
                                    </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        MCP Tool Result
                                      </span>
                                    </div>
                                    <div className="text-sm">
                                      {renderToolOutput((part as any).toolName || 'unknown', part.output)}
                                    </div>
                                  </div>
                                )
                              }
                              break

                            default:
                              return null
                          }
                        })}
                      </div>

                      {message.role === "user" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}

                  {status && (status as string) !== "idle" && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-background border border-border rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Timeout Warning */}
                {showTimeoutWarning && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Response is taking longer than expected. This might be due to MCP server connection issues.
                      </p>
                    </div>
                  </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Ask about your metadata..."
                    disabled={status && (status as string) !== "idle"}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={status && (status as string) !== "idle"} className="gap-2">
                    {status && (status as string) !== "idle" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* MCP Server Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {mcpConnectionStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {mcpConnectionStatus === 'disconnected' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {mcpConnectionStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />}
                    MCP Server Status
                  </CardTitle>
                  <CardDescription>
                    {mcpConnectionStatus === 'connected' && 'Connected to Gravitino MCP Server'}
                    {mcpConnectionStatus === 'disconnected' && 'Disconnected from MCP Server'}
                    {mcpConnectionStatus === 'checking' && 'Checking connection...'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={mcpConnectionStatus === 'connected' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {mcpConnectionStatus === 'connected' && 'Online'}
                      {mcpConnectionStatus === 'disconnected' && 'Offline'}
                      {mcpConnectionStatus === 'checking' && 'Checking...'}
                    </Badge>
                    {mcpConnectionStatus === 'connected' && (
                      <span className="text-xs text-green-600">Ready to assist</span>
                    )}
                    {mcpConnectionStatus === 'disconnected' && (
                      <span className="text-xs text-red-600">Please check MCP server</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Suggested Questions</CardTitle>
                  <CardDescription>Try asking these questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 px-3 bg-transparent"
                      onClick={() => {
                        sendMessage({ text: question })
                      }}
                      disabled={status && (status as string) !== "idle"}
                    >
                      <span className="text-sm text-balance">{question}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Available Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Available Tools</CardTitle>
                  <CardDescription>Powered by Cursor + Gemini • Connected to Gravitino MCP Server</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        getListOfCatalogs
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        getListOfSchemas
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        getListOfTables
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        getTableMetadataDetails
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        listOfJobs
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        listOfJobTemplates
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        listOfTags
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        getListOfPolicies
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        listOfModels
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        listOfTopics
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        listOfFilesets
                      </Badge>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Cursor MCP Integration:</div>
                      <div className="text-xs text-muted-foreground">
                        Direct access to Gravitino through Cursor's MCP server
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
