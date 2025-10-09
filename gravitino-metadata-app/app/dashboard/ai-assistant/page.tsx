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
import { Send, Bot, User, Loader2 } from "lucide-react"
import { useRef, useEffect } from "react"

export default function AIAssistantPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
    "List all catalogs",
    "Show me schemas in production_catalog",
    "What tables are in the public schema?",
    "Get the schema for the users table",
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
                <CardDescription>Connected to Gravitino MCP Server</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages */}
                <div className="h-[500px] overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <Bot className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium">Welcome to Gravitino AI Assistant</p>
                        <p className="text-sm text-muted-foreground">
                          Ask me anything about your metadata catalogs, schemas, and tables
                        </p>
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

                            case "tool-listCatalogs":
                            case "tool-listSchemas":
                            case "tool-listTables":
                            case "tool-getTableSchema":
                            case "tool-searchMetadata":
                              if (part.state === "output-available") {
                                return (
                                  <div key={index} className="text-xs text-muted-foreground mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                      Tool: {part.toolName}
                                    </Badge>
                                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                      {JSON.stringify(part.output, null, 2)}
                                    </pre>
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

                  {status === "in_progress" && (
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

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Ask about your metadata..."
                    disabled={status === "in_progress"}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={status === "in_progress"} className="gap-2">
                    {status === "in_progress" ? (
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
                      disabled={status === "in_progress"}
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
                  <CardDescription>Connected to Gravitino MCP Server</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        listCatalogs
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        listSchemas
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        listTables
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        getTableSchema
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        searchMetadata
                      </Badge>
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
