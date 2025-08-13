"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CheckCircle, XCircle } from "lucide-react"

interface AddIntegrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (integration: any) => void
}

export function AddIntegrationModal({ open, onOpenChange, onAdd }: AddIntegrationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    endpoint: "",
    apiKey: "",
    description: "",
  })
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (testStatus === "success") {
      onAdd({
        ...formData,
        status: "connected",
        lastSync: "Just now",
      })
      setFormData({ name: "", endpoint: "", apiKey: "", description: "" })
      setTestStatus("idle")
    }
  }

  const handleTestConnection = async () => {
    setTestStatus("testing")
    // Simulate API test
    setTimeout(() => {
      setTestStatus(Math.random() > 0.3 ? "success" : "error")
    }, 2000)
  }

  const resetForm = () => {
    setFormData({ name: "", endpoint: "", apiKey: "", description: "" })
    setTestStatus("idle")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) resetForm()
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Integration</DialogTitle>
          <DialogDescription>Connect a new MCP server to expand your AI's capabilities</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Integration Name</Label>
            <Input
              id="name"
              placeholder="e.g., Customer Database"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint URL</Label>
            <Input
              id="endpoint"
              placeholder="https://api.example.com/mcp"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API key"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what this integration provides"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={!formData.endpoint || !formData.apiKey || testStatus === "testing"}
              className="gap-2 bg-transparent"
            >
              {testStatus === "testing" && <LoadingSpinner />}
              {testStatus === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
              {testStatus === "error" && <XCircle className="h-4 w-4 text-red-600" />}
              Test Connection
            </Button>

            {testStatus === "success" && <span className="text-sm text-green-600">Connection successful!</span>}
            {testStatus === "error" && <span className="text-sm text-red-600">Connection failed</span>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={testStatus !== "success"}>
              Add Integration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
