"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Info, Loader2, Upload, Search, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useDashboardContext } from "@/context/dashboard-context"
import { Badge } from "@/components/ui/badge"

type ServerType = "AIR" | "SDP" | "CCN" | "OCC" | ""
type StatusType = "idle" | "loading" | "success" | "error" | "selection"
type SelectionType = "metric" | "category" | "columns" | ""

interface Category {
  full: string
  display: string
}

export function DashboardUploader() {
  const { setDashboardInfo } = useDashboardContext()
  const [server, setServer] = useState<ServerType>("")
  const [dashboardName, setDashboardName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<StatusType>("idle")
  const [message, setMessage] = useState("")
  const [dashboardUrl, setDashboardUrl] = useState("")
  const [selectionType, setSelectionType] = useState<SelectionType>("")

  // Selection options
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [filteredColumns, setFilteredColumns] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Selected values
  const [selectedMetric, setSelectedMetric] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])

  // Effect to filter columns based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredColumns(availableColumns)
    } else {
      const filtered = availableColumns.filter((column) => column.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredColumns(filtered)
    }
  }, [searchQuery, availableColumns])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleServerChange = (value: string) => {
    setServer(value as ServerType)
  }

  const resetState = () => {
    setSelectedMetric("")
    setSelectedCategory("")
    setSelectedColumns([])
    setSearchQuery("")
    setFilteredColumns([])
    setDashboardUrl("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !server || !dashboardName) return

    // Reset previous selections when uploading a new file
    resetState()

    setStatus("loading")
    setMessage("Uploading and processing file...")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("dashboard_name", dashboardName)
    formData.append("server_name", server)

    // Add selection data if we're submitting after a selection
    if (selectionType === "metric" && selectedMetric) {
      formData.append("selected_metric", selectedMetric)
    } else if (selectionType === "category" && selectedCategory) {
      formData.append("selected_category", selectedCategory)
    } else if (selectionType === "columns" && selectedColumns.length > 0) {
      formData.append("selected_columns", selectedColumns.join(","))
    }

    try {
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        if (result.status === "metric_selection_required") {
          setSelectionType("metric")
          setAvailableMetrics(result.available_metrics)
          setStatus("selection")
          setMessage("Please select a metric to visualize")
        } else if (result.status === "occ_selection_required") {
          setSelectionType("category")
          setAvailableCategories(result.available_categories)
          setStatus("selection")
          setMessage("Please select a category to visualize")
        } else if (result.status === "columns_selection_required") {
          setSelectionType("columns")
          setAvailableColumns(result.available_columns)
          setFilteredColumns(result.available_columns)
          setStatus("selection")
          setMessage("Please select items to include in the dashboard")
        } else {
          // Dashboard created successfully
          setStatus("success")
          setMessage(`Success! Dashboard "${result.dashboard_name}" created.`)
          setDashboardUrl(result.dashboard_url || "")

          // Update context for the chatbot
          setDashboardInfo({
            server,
            dashboard: dashboardName,
            metrics: selectedColumns,
            category: selectedCategory,
            metric: selectedMetric,
          })
        }
      } else {
        setStatus("error")
        setMessage(result.detail || "Unknown error occurred")
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      console.error(error)
    }
  }

  const handleCreateDashboard = () => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  const handleColumnSelection = (column: string, checked: boolean) => {
    if (checked) {
      setSelectedColumns([...selectedColumns, column])
    } else {
      setSelectedColumns(selectedColumns.filter((c) => c !== column))
    }
  }

  const handleSelectAll = () => {
    setSelectedColumns([...availableColumns])
  }

  const handleDeselectAll = () => {
    setSelectedColumns([])
  }

  const areAllSelected = selectedColumns.length === availableColumns.length && availableColumns.length > 0

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  return (
    <Card className="bg-ericsson-card/80 backdrop-blur-sm border-ericsson-border/50 shadow-xl rounded-xl overflow-hidden h-full">
      <CardHeader className="border-b border-ericsson-border/30 bg-gradient-to-r from-ericsson-navy to-ericsson-navy-light">
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="h-5 w-5 text-ericsson-accent" />
          Upload Request Log File
        </CardTitle>
        <CardDescription className="text-ericsson-text-secondary">
          Upload your Ericsson request log file to create a visualization dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="server-name" className="text-ericsson-text-secondary font-medium">
              Server
            </Label>
            <Select value={server} onValueChange={handleServerChange} required>
              <SelectTrigger
                id="server-name"
                className="bg-ericsson-input/50 backdrop-blur-sm border-ericsson-border/50 text-white rounded-lg focus:ring-ericsson-accent focus:border-ericsson-accent/50"
              >
                <SelectValue placeholder="Select a server" />
              </SelectTrigger>
              <SelectContent className="bg-ericsson-dropdown/95 backdrop-blur-sm border-ericsson-border/50 rounded-lg">
                <SelectItem value="AIR" className="text-white focus:bg-ericsson-hover focus:text-white">
                  AIR
                </SelectItem>
                <SelectItem value="SDP" className="text-white focus:bg-ericsson-hover focus:text-white">
                  SDP
                </SelectItem>
                <SelectItem value="CCN" className="text-white focus:bg-ericsson-hover focus:text-white">
                  CCN
                </SelectItem>
                <SelectItem value="OCC" className="text-white focus:bg-ericsson-hover focus:text-white">
                  OCC
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dashboard-name" className="text-ericsson-text-secondary font-medium">
              Dashboard Name
            </Label>
            <Input
              id="dashboard-name"
              placeholder="Enter dashboard name"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              required
              className="bg-ericsson-input/50 backdrop-blur-sm border-ericsson-border/50 text-white placeholder:text-ericsson-text-secondary/70 rounded-lg focus:ring-ericsson-accent focus:border-ericsson-accent/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-input" className="text-ericsson-text-secondary font-medium">
              Log File
            </Label>
            <Input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              required
              className="bg-ericsson-input/50 backdrop-blur-sm border-ericsson-border/50 text-white file:bg-ericsson-accent file:text-white file:border-0 file:rounded-md file:font-medium file:px-3 file:py-1 file:mr-3 rounded-lg"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-ericsson-blue to-ericsson-accent hover:from-ericsson-blue-hover hover:to-ericsson-accent-hover text-white font-medium py-5 rounded-lg transition-all duration-300 shadow-lg shadow-ericsson-blue/20"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload File
          </Button>
        </form>

        {status === "selection" && (
          <div className="mt-8 p-5 border rounded-xl border-ericsson-border/30 bg-ericsson-panel/50 backdrop-blur-sm shadow-lg">
            <h3 className="font-semibold mb-4 text-white flex items-center">
              <span className="bg-ericsson-accent/20 text-ericsson-accent px-2 py-1 rounded-md text-sm mr-2">
                Step 2
              </span>
              {selectionType === "metric" && "Select a metric to visualize:"}
              {selectionType === "category" && "Select a category to visualize:"}
              {selectionType === "columns" && `Select ${server === "CCN" ? "counters" : "metrics"} to visualize:`}
            </h3>

            {selectionType === "metric" && (
              <div className="bg-ericsson-panel-light/50 backdrop-blur-sm p-4 rounded-xl border border-ericsson-border/30 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableMetrics.map((metric) => (
                    <div
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className={`flex items-center p-3 rounded-lg transition-all duration-200 cursor-pointer
                ${
                  selectedMetric === metric
                    ? "bg-gradient-to-r from-ericsson-blue/20 to-ericsson-accent/20 border border-ericsson-accent/30 shadow-md"
                    : "hover:bg-ericsson-hover/50 border border-transparent"
                }
              `}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border-2 
                    ${selectedMetric === metric ? "border-ericsson-accent bg-ericsson-accent/20" : "border-ericsson-border"}`}
                        >
                          {selectedMetric === metric && <div className="w-2 h-2 rounded-full bg-ericsson-accent"></div>}
                        </div>
                        <span className="text-white font-medium">{metric}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectionType === "category" && (
              <div className="bg-ericsson-panel-light/50 backdrop-blur-sm p-4 rounded-xl border border-ericsson-border/30 shadow-inner">
                <div className="space-y-3">
                  {availableCategories.map((category) => (
                    <div
                      key={category.full}
                      onClick={() => setSelectedCategory(category.full)}
                      className={`flex items-center p-3 rounded-lg transition-all duration-200 cursor-pointer
                ${
                  selectedCategory === category.full
                    ? "bg-gradient-to-r from-ericsson-blue/20 to-ericsson-accent/20 border border-ericsson-accent/30 shadow-md"
                    : "hover:bg-ericsson-hover/50 border border-transparent"
                }
              `}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border-2 
                    ${selectedCategory === category.full ? "border-ericsson-accent bg-ericsson-accent/20" : "border-ericsson-border"}`}
                        >
                          {selectedCategory === category.full && (
                            <div className="w-2 h-2 rounded-full bg-ericsson-accent"></div>
                          )}
                        </div>
                        <div>
                          <span className="text-white font-medium">{category.display}</span>
                          <p className="text-xs text-ericsson-text-secondary mt-1">{category.full}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectionType === "columns" && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-ericsson-accent/20 text-ericsson-accent border-ericsson-accent/30 px-3 py-1"
                    >
                      {selectedColumns.length} of {availableColumns.length} selected
                    </Badge>

                    {selectedColumns.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeselectAll}
                        className="border-ericsson-border/50 text-ericsson-text-secondary hover:bg-ericsson-hover/50 rounded-md"
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2 relative w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ericsson-text-secondary" />
                      <Input
                        placeholder="Search metrics..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="bg-ericsson-input/50 backdrop-blur-sm border-ericsson-border/50 text-white placeholder:text-ericsson-text-secondary/70 rounded-lg focus:ring-ericsson-accent focus:border-ericsson-accent/50 h-9 pl-9 pr-8"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ericsson-text-secondary hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={areAllSelected ? handleDeselectAll : handleSelectAll}
                      className={`${
                        areAllSelected
                          ? "border-ericsson-border/50 text-ericsson-text-secondary hover:bg-ericsson-hover/50"
                          : "border-ericsson-accent text-ericsson-accent hover:bg-ericsson-accent/20"
                      } rounded-md whitespace-nowrap`}
                    >
                      {areAllSelected ? "Unselect All" : "Select All"}
                    </Button>
                  </div>
                </div>

                <div className="bg-ericsson-panel-light/50 backdrop-blur-sm p-4 rounded-xl border border-ericsson-border/30 shadow-inner max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-ericsson-border scrollbar-track-transparent">
                  {filteredColumns.length === 0 ? (
                    <div className="text-center py-4 text-ericsson-text-secondary">No metrics match your search</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {filteredColumns.map((column) => (
                        <div
                          key={column}
                          onClick={() => handleColumnSelection(column, !selectedColumns.includes(column))}
                          className={`flex items-center p-3 rounded-lg transition-all duration-200 cursor-pointer
                    ${
                      selectedColumns.includes(column)
                        ? "bg-gradient-to-r from-ericsson-blue/20 to-ericsson-accent/20 border border-ericsson-accent/30 shadow-md"
                        : "hover:bg-ericsson-hover/50 border border-transparent"
                    }
                  `}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center border 
                        ${selectedColumns.includes(column) ? "border-ericsson-accent bg-ericsson-accent text-white" : "border-ericsson-border"}`}
                            >
                              {selectedColumns.includes(column) && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <span className="text-white font-medium truncate" title={column}>
                              {column}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-ericsson-navy/30 rounded-lg p-3 text-ericsson-text-secondary text-sm">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 text-ericsson-info" />
                    <span>
                      Select the metrics you want to include in your visualization dashboard. You can select multiple
                      items.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateDashboard}
              className="mt-6 w-full bg-gradient-to-r from-ericsson-blue to-ericsson-accent hover:from-ericsson-blue-hover hover:to-ericsson-accent-hover text-white font-medium py-5 rounded-lg transition-all duration-300 shadow-lg shadow-ericsson-blue/20"
              disabled={
                (selectionType === "metric" && !selectedMetric) ||
                (selectionType === "category" && !selectedCategory) ||
                (selectionType === "columns" && selectedColumns.length === 0)
              }
            >
              Create Dashboard
            </Button>
          </div>
        )}

        {status !== "idle" && status !== "selection" && (
          <Alert className="mt-6 border-ericsson-border/30 rounded-xl shadow-lg" variant="default">
            <div
              className={`
              p-4 rounded-lg backdrop-blur-sm
              ${
                status === "error"
                  ? "bg-ericsson-error/10 border border-ericsson-error/30"
                  : status === "success"
                    ? "bg-ericsson-success/10 border border-ericsson-success/30"
                    : "bg-ericsson-info/10 border border-ericsson-info/30"
              }
            `}
            >
              <div className="flex items-start">
                {status === "error" && <AlertCircle className="h-5 w-5 mt-0.5 mr-3 text-ericsson-error" />}
                {status === "success" && <CheckCircle2 className="h-5 w-5 mt-0.5 mr-3 text-ericsson-success" />}
                {status === "loading" && <Info className="h-5 w-5 mt-0.5 mr-3 text-ericsson-info" />}
                <div>
                  <AlertTitle
                    className={`text-lg ${
                      status === "error"
                        ? "text-ericsson-error"
                        : status === "success"
                          ? "text-ericsson-success"
                          : "text-ericsson-info"
                    }
                  `}
                  >
                    {status === "error" ? "Error" : status === "success" ? "Success" : "Processing"}
                  </AlertTitle>
                  <AlertDescription className="text-ericsson-text-secondary mt-1">
                    {message}
                    {status === "success" && dashboardUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="ml-4 border-ericsson-accent text-ericsson-accent hover:bg-ericsson-accent/20 rounded-md"
                      >
                        <a href={dashboardUrl} target="_blank" rel="noopener noreferrer">
                          View Dashboard
                        </a>
                      </Button>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
