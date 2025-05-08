"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Loader2,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  LineChart,
  User,
  ArrowDown,
  ArrowUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboardContext } from "@/context/dashboard-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

type AnalysisType = "general" | "trends" | "anomalies" | "comparison" | "suggestions"
type MessageType = "user" | "bot"

interface Message {
  type: MessageType
  content: string
  isTyping?: boolean
  timestamp?: string
}

export function AnalysisAssistant() {
  const { dashboardInfo } = useDashboardContext()
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "bot",
      content: "Hello! I'm your dashboard analysis assistant. Upload a file and I can help you analyze the data.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [input, setInput] = useState("")
  const [analysisType, setAnalysisType] = useState<AnalysisType>("general")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Scroll to bottom when messages change if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, autoScroll])

  // Update bot message when dashboard info changes
  useEffect(() => {
    if (dashboardInfo.dashboard && dashboardInfo.server) {
      let metricInfo = ""

      if (dashboardInfo.metric) {
        metricInfo = `the ${dashboardInfo.metric} metric`
      } else if (dashboardInfo.category) {
        metricInfo = `the ${dashboardInfo.category} category`
      } else if (dashboardInfo.metrics && dashboardInfo.metrics.length > 0) {
        metricInfo = `${dashboardInfo.metrics.length} metrics`
      }

      setMessages([
        ...messages,
        {
          type: "bot",
          content: `I'm ready to analyze the ${dashboardInfo.dashboard} dashboard for ${dashboardInfo.server} server with ${metricInfo}. What would you like to know?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    }
  }, [dashboardInfo])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage = {
      type: "user" as MessageType,
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages([...messages, userMessage])

    // Clear input
    setInput("")

    // Add typing indicator
    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        content: "",
        isTyping: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])
    setIsLoading(true)

    try {
      // Build context object
      const context = {
        server: dashboardInfo.server,
        dashboard: dashboardInfo.dashboard,
        selected_metrics: dashboardInfo.metrics,
        selected_category: dashboardInfo.category,
        selected_metric: dashboardInfo.metric,
        analysis_type: analysisType,
      }

      const response = await fetch("http://localhost:8000/chatbot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          analysis_type: analysisType,
          context: context,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Remove typing indicator and add bot response
      setMessages((prev) =>
        prev
          .filter((msg) => !msg.isTyping)
          .concat({
            type: "bot",
            content: data.response || "Sorry, I got an empty response.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }),
      )
    } catch (error) {
      // Remove typing indicator and add error message
      setMessages((prev) =>
        prev
          .filter((msg) => !msg.isTyping)
          .concat({
            type: "bot",
            content: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }),
      )
      console.error("Fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend()
    }
  }

  const handleTabChange = (value: string) => {
    setAnalysisType(value as AnalysisType)

    // Auto-send prompts based on analysis type
    if (dashboardInfo.dashboard && dashboardInfo.server) {
      let promptText = ""

      switch (value) {
        case "general":
          promptText = "Give me a general overview of the data"
          break
        case "trends":
          promptText = "What trends do you see in this data?"
          break
        case "anomalies":
          promptText = "Are there any anomalies in this data?"
          break
        case "comparison":
          promptText = "Compare the different metrics in this data"
          break
        case "suggestions":
          promptText = "What visualizations would work best for this data?"
          break
      }

      if (promptText) {
        setInput(promptText)
        // Automatically send the message without requiring user to press Enter
        setTimeout(() => {
          handleSend()
        }, 100)
      }
    }
  }

  const getTabIcon = (type: AnalysisType) => {
    switch (type) {
      case "general":
        return <MessageSquare className="h-4 w-4 mr-2" />
      case "trends":
        return <TrendingUp className="h-4 w-4 mr-2" />
      case "anomalies":
        return <AlertTriangle className="h-4 w-4 mr-2" />
      case "comparison":
        return <BarChart3 className="h-4 w-4 mr-2" />
      case "suggestions":
        return <LineChart className="h-4 w-4 mr-2" />
    }
  }

  const scrollToBottom = () => {
    setAutoScroll(true)
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToTop = () => {
    setAutoScroll(false)
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0
    }
  }

  return (
    <Card className="bg-ericsson-card/80 backdrop-blur-sm border-ericsson-border/50 shadow-xl rounded-xl overflow-hidden h-full flex flex-col">
      <CardHeader className="border-b border-ericsson-border/30 bg-gradient-to-r from-ericsson-navy to-ericsson-navy-light">
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-ericsson-accent" />
          Dashboard Analysis Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <Tabs
          defaultValue="general"
          value={analysisType}
          onValueChange={handleTabChange}
          className="flex-1 flex flex-col"
        >
          <TabsList className="flex justify-between p-1 mx-4 mt-4 bg-ericsson-panel/70 backdrop-blur-sm border border-ericsson-border/30 rounded-xl">
            <TabsTrigger
              value="general"
              className="flex-1 data-[state=active]:bg-gradient-to-r from-ericsson-blue to-ericsson-accent data-[state=active]:text-white text-ericsson-text-secondary rounded-lg py-2"
            >
              {getTabIcon("general")}
              General
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="flex-1 data-[state=active]:bg-gradient-to-r from-ericsson-blue to-ericsson-accent data-[state=active]:text-white text-ericsson-text-secondary rounded-lg py-2"
            >
              {getTabIcon("trends")}
              Trends
            </TabsTrigger>
            <TabsTrigger
              value="anomalies"
              className="flex-1 data-[state=active]:bg-gradient-to-r from-ericsson-blue to-ericsson-accent data-[state=active]:text-white text-ericsson-text-secondary rounded-lg py-2"
            >
              {getTabIcon("anomalies")}
              Anomalies
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="flex-1 data-[state=active]:bg-gradient-to-r from-ericsson-blue to-ericsson-accent data-[state=active]:text-white text-ericsson-text-secondary rounded-lg py-2"
            >
              {getTabIcon("comparison")}
              Comparison
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              className="flex-1 data-[state=active]:bg-gradient-to-r from-ericsson-blue to-ericsson-accent data-[state=active]:text-white text-ericsson-text-secondary rounded-lg py-2"
            >
              {getTabIcon("suggestions")}
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value={analysisType} className="flex-1 flex flex-col p-6 pt-4">
            <div className="flex-1 relative">
              <ScrollArea
                className="absolute inset-0 border rounded-xl border-ericsson-border/30 bg-ericsson-panel/50 backdrop-blur-sm shadow-inner"
                ref={scrollAreaRef}
              >
                <div className="p-4 space-y-6 pb-2">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3",
                        message.type === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {message.type === "bot" && (
                        <Avatar className="h-8 w-8 border-2 border-ericsson-accent/30">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Ericsson Bot" />
                          <AvatarFallback className="bg-ericsson-navy text-ericsson-accent">
                            <div className="relative h-5 w-5">
                              <Image
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-wS0sYcrFdhmH8QlD9jPDEAz0OZPLB3.png"
                                alt="Ericsson Logo"
                                fill
                                className="object-contain"
                              />
                            </div>
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "flex flex-col max-w-[75%]",
                          message.type === "user" ? "items-end" : "items-start",
                        )}
                      >
                        <div
                          className={cn(
                            "p-4 rounded-2xl shadow-md",
                            message.type === "user"
                              ? "bg-gradient-to-r from-ericsson-blue to-ericsson-accent text-white rounded-tr-none"
                              : message.isTyping
                                ? "bg-ericsson-panel-light/70 backdrop-blur-sm border border-ericsson-border/30 text-white"
                                : "bg-gradient-to-br from-ericsson-navy-light to-ericsson-navy border border-ericsson-border/30 text-white rounded-tl-none",
                          )}
                        >
                          {message.isTyping ? (
                            <div className="flex items-center text-ericsson-text-secondary">
                              <div className="flex space-x-1">
                                <div className="h-2 w-2 rounded-full bg-ericsson-accent/70 animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="h-2 w-2 rounded-full bg-ericsson-accent/70 animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="h-2 w-2 rounded-full bg-ericsson-accent/70 animate-bounce"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="whitespace-pre-line">{message.content}</div>
                          )}
                        </div>

                        {message.timestamp && (
                          <span className="text-xs text-ericsson-text-secondary mt-1 px-2">{message.timestamp}</span>
                        )}
                      </div>

                      {message.type === "user" && (
                        <Avatar className="h-8 w-8 border-2 border-ericsson-blue/30">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                          <AvatarFallback className="bg-ericsson-blue text-white">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </ScrollArea>

              {/* Chat navigation controls */}
              <div className="absolute right-4 bottom-4 flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full bg-ericsson-navy/70 border-ericsson-border/30 text-ericsson-text-secondary hover:text-white hover:bg-ericsson-blue/50"
                  onClick={scrollToTop}
                  title="Scroll to top"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full bg-ericsson-navy/70 border-ericsson-border/30 text-ericsson-text-secondary hover:text-white hover:bg-ericsson-blue/50"
                  onClick={scrollToBottom}
                  title="Scroll to bottom"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Input
                placeholder="Ask about the dashboard data..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || !dashboardInfo.dashboard}
                className="flex-1 bg-ericsson-input/50 backdrop-blur-sm border-ericsson-border/50 text-white placeholder:text-ericsson-text-secondary/70 rounded-lg focus:ring-ericsson-accent focus:border-ericsson-accent/50 py-6"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim() || !dashboardInfo.dashboard}
                className="bg-gradient-to-r from-ericsson-blue to-ericsson-accent hover:from-ericsson-blue-hover hover:to-ericsson-accent-hover text-white h-12 w-12 rounded-lg transition-all duration-300 shadow-lg shadow-ericsson-blue/20"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>

            {!dashboardInfo.dashboard && (
              <div className="mt-4 p-3 rounded-lg bg-ericsson-navy/30 border border-ericsson-border/30 text-ericsson-text-secondary text-sm text-center">
                Upload a file to start analyzing your data
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
