"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
      <DialogContent className="flex w-[min(100vw-2rem,440px)] flex-col gap-6 rounded-lg border border-input bg-background p-6 shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="google-headline-small">Add new integration</DialogTitle>
          <DialogDescription className="google-body-medium text-muted-foreground">
            Connect a new MCP server or external service to your CoreComm platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="google-label-medium text-muted-foreground">
              Integration name
            </Label>
            <Input
              id="name"
              placeholder="Knowledge Base API"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-11 rounded-sm border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="google-label-medium text-muted-foreground">
              Integration type
            </Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="h-11 rounded-sm border-input">
                <SelectValue placeholder="Select integration type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="knowledge-base">Knowledge base</SelectItem>
                <SelectItem value="crm">CRM system</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="api">REST API</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint" className="google-label-medium text-muted-foreground">
              Endpoint URL
            </Label>
            <Input
              id="endpoint"
              type="url"
              placeholder="https://api.example.com/v1"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              className="h-11 rounded-sm border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey" className="google-label-medium text-muted-foreground">
              API key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="h-11 rounded-sm border-input"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isLoading || !formData.endpoint || !formData.apiKey}
              className="flex-1 rounded-sm border-input bg-transparent"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Testing...
                </>
              ) : (
                "Test connection"
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
            <p className="text-sm text-red-600">Connection failed. Check your endpoint URL and API key.</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={testResult !== "success"} className="rounded-sm">
              Add integration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
