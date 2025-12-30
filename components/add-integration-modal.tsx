"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "./loading-spinner"
import { CheckCircle, XCircle } from "lucide-react"
import { useIntegrations } from "@/hooks/use-integrations"

interface AddIntegrationModalProps {
  children: React.ReactNode
}

export function AddIntegrationModal({ children }: AddIntegrationModalProps) {
  const { createIntegration } = useIntegrations()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    type: "" as "mcp" | "webhook" | "api" | "crm" | "helpdesk" | "",
    endpoint: "",
    apiKey: "",
    description: "",
  })

  const handleTestConnection = async () => {
    setIsLoading(true)
    setTestResult(null)
    setErrorMessage("")

    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          endpoint: formData.endpoint,
          apiKey: formData.apiKey
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setTestResult("error")
        setErrorMessage(data.error || "Connection failed")
      } else {
        setTestResult("success")
      }
    } catch (error) {
      setTestResult("error")
      setErrorMessage("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage("")

    const result = await createIntegration({
      name: formData.name,
      type: formData.type as "mcp" | "webhook" | "api" | "crm" | "helpdesk",
      endpoint_url: formData.endpoint || 'https://api.hubapi.com', // Default for CRM if empty
      description: formData.description,
      config: {
        apiKey: formData.apiKey,
        url: formData.endpoint, // For webhook
        accessToken: formData.apiKey, // For CRM
      },
      status: "active",
    })

    setIsSaving(false)

    if (result.error) {
      setErrorMessage(result.error)
      return
    }

    // Success - close modal and reset form
    setOpen(false)
    setFormData({ name: "", type: "", endpoint: "", apiKey: "", description: "" })
    setTestResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex w-[min(100vw-2rem,440px)] max-h-[85vh] overflow-y-auto flex-col gap-6 rounded-lg border border-input bg-background p-6 shadow-2xl">
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
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
              <SelectTrigger className="h-11 rounded-sm border-input">
                <SelectValue placeholder="Select integration type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcp">MCP Server</SelectItem>
                <SelectItem value="crm">CRM System</SelectItem>
                <SelectItem value="helpdesk">Helpdesk</SelectItem>
                <SelectItem value="api">REST API</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="google-label-medium text-muted-foreground">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of this integration..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[80px] rounded-sm border-input resize-none"
            />
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

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              className="rounded-sm"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || !formData.name || !formData.type || !formData.endpoint} 
              className="rounded-sm"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Adding...
                </>
              ) : (
                "Add integration"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
