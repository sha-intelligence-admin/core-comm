"use client"

import { useState } from "react"
import { IntegrationCard } from "@/components/integration-card"
import { AddIntegrationModal } from "@/components/add-integration-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const mockIntegrations = [
  {
    id: "1",
    name: "Customer Database",
    endpoint: "https://api.customerdb.com/mcp",
    status: "connected",
    lastSync: "2 minutes ago",
    description: "Access customer information and history",
  },
  {
    id: "2",
    name: "Knowledge Base",
    endpoint: "https://kb.company.com/mcp",
    status: "connected",
    lastSync: "5 minutes ago",
    description: "Company knowledge base and documentation",
  },
  {
    id: "3",
    name: "Ticketing System",
    endpoint: "https://tickets.company.com/mcp",
    status: "error",
    lastSync: "1 hour ago",
    description: "Create and manage support tickets",
  },
]

export default function IntegrationsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [integrations, setIntegrations] = useState(mockIntegrations)

  const handleAddIntegration = (integration: any) => {
    setIntegrations([...integrations, { ...integration, id: Date.now().toString() }])
    setShowAddModal(false)
  }

  const handleDeleteIntegration = (id: string) => {
    setIntegrations(integrations.filter((i) => i.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Integrations</h2>
          <p className="text-muted-foreground">Manage your MCP server connections</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Integration
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Connected MCP Servers</CardTitle>
          <CardDescription>These integrations provide your AI with access to external systems and data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} onDelete={handleDeleteIntegration} />
            ))}
          </div>
        </CardContent>
      </Card>

      <AddIntegrationModal open={showAddModal} onOpenChange={setShowAddModal} onAdd={handleAddIntegration} />
    </div>
  )
}
