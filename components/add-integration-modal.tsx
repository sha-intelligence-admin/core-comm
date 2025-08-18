"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "./loading-spinner"
import { CheckCircle, XCircle } from "lucide-react"

interface AddIntegrationModalProps {
  children: React.ReactNode
}

export function AddIntegrationModal({ children }: AddIntegrationModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    endpoint: "",
    apiKey: "",
  })

  const handleTestConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate random success/failure
    const success = Math.random() > 0.3
    setTestResult(success ? "success" : "error")
    setIsLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Integration data:", formData)
    setOpen(false)
    setFormData({ name: "", type: "", endpoint: "", apiKey: "" })
    setTestResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl backdrop-blur-md bg-background/95 border border-brand/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Add New Integration</DialogTitle>
          <DialogDescription>Connect a new MCP server or external service to your CoreComm platform.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Integration Name</Label>
            <Input
              id="name"
              placeholder="Knowledge Base API"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Integration Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select integration type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="knowledge-base">Knowledge Base</SelectItem>
                <SelectItem value="crm">CRM System</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="api">REST API</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint URL</Label>
            <Input
              id="endpoint"
              type="url"
              placeholder="https://api.example.com/v1"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="rounded-xl"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isLoading || !formData.endpoint || !formData.apiKey}
              className="rounded-xl flex-1 bg-transparent"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>

            {testResult && (
              <div className="flex items-center">
                {testResult === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            )}
          </div>

          {testResult === "error" && (
            <p className="text-sm text-red-600">Connection failed. Please check your endpoint URL and API key.</p>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={testResult !== "success"} className="rounded-xl">
              Add Integration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
