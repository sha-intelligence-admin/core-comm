import { IntegrationCard } from "@/components/integration-card"
import { AddIntegrationModal } from "@/components/add-integration-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Server, Database, MessageSquare } from "lucide-react"

const mockIntegrations = [
  {
    id: "1",
    name: "Knowledge Base API",
    type: "Knowledge Base",
    endpoint: "https://api.company.com/kb",
    status: "connected" as const,
    lastSync: "2 minutes ago",
    icon: Database,
  },
  {
    id: "2",
    name: "CRM Integration",
    type: "Customer Data",
    endpoint: "https://crm.company.com/api",
    status: "connected" as const,
    lastSync: "5 minutes ago",
    icon: Server,
  },
  {
    id: "3",
    name: "Slack Notifications",
    type: "Communication",
    endpoint: "https://hooks.slack.com/services/...",
    status: "error" as const,
    lastSync: "1 hour ago",
    icon: MessageSquare,
  },
]

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">Manage your MCP servers and external integrations</p>
        </div>
        <AddIntegrationModal>
          <Button className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </AddIntegrationModal>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockIntegrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Integration Health</CardTitle>
          <CardDescription>Monitor the status and performance of your integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="font-medium">Knowledge Base API</span>
              </div>
              <div className="text-sm text-muted-foreground">Response time: 120ms</div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="font-medium">CRM Integration</span>
              </div>
              <div className="text-sm text-muted-foreground">Response time: 85ms</div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="font-medium">Slack Notifications</span>
              </div>
              <div className="text-sm text-muted-foreground">Connection failed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
