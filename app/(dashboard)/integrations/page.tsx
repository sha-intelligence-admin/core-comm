"use client"

import { IntegrationCard } from "@/components/integration-card"
import { AddIntegrationModal } from "@/components/add-integration-modal"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useIntegrations } from "@/hooks/use-integrations"
import {
  Plus,
  Server,
  Database,
  MessageSquare,
  Phone,
  Mail,
  Plug,
  Bell,
  RefreshCw,
  CheckCircle,
  Settings,
  Zap,
} from "lucide-react"

export default function IntegrationsPage() {
  const { integrations, loading, fetchIntegrations } = useIntegrations()

  const handleRefreshAll = async () => {
    await fetchIntegrations()
  }

  // Map integrations to cards format
  const integrationCards = integrations.map((integration) => ({
    id: integration.id,
    name: integration.name,
    type: integration.type === 'crm' ? 'Customer Data' : 
          integration.type === 'webhook' ? 'Workflow' : 'Communication',
    endpoint: integration.endpoint_url,
    status: integration.status === 'active' ? 'connected' as const : 
            integration.status === 'error' ? 'error' as const : 
            integration.status === 'pending' ? 'pending' as const : 'connected' as const,
    lastSync: integration.last_sync || 'Never',
    icon: integration.type === 'crm' ? Database :
          integration.type === 'webhook' ? Bell :
          integration.type === 'api' ? Server : Phone,
  }))

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="google-headline-medium">Integrations</h1>
          <p className="google-body-medium text-muted-foreground">
            Connect CoreComm with your communication providers, CRM systems, and workflow tools
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddIntegrationModal>
            <Button className="h-11 rounded-sm px-6 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Integration
            </Button>
          </AddIntegrationModal>
          <Button 
            variant="outline" 
            className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white"
            onClick={handleRefreshAll}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync All
          </Button>
          <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
        <CardHeader className="rounded-t-sm">
          <div className="google-headline-small">Active connections</div>
          <div className="google-body-medium text-muted-foreground">
            Monitor integration status and sync health
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : integrationCards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {integrationCards.map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Plug className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="google-body-medium text-muted-foreground">
                No integrations configured yet. Click "Add Integration" to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
          <CardHeader className="rounded-t-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <div className="google-headline-small text-foreground">Communication</div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="google-body-small text-muted-foreground mb-4">
              Connect voice, email, and messaging platforms like Twilio, Gmail, WhatsApp, and Telegram
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="google-body-small text-muted-foreground">Voice call routing</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="google-body-small text-muted-foreground">Email automation</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="google-body-small text-muted-foreground">Messaging channels</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
          <CardHeader className="rounded-t-sm">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <div className="google-headline-small text-foreground">CRM & Support</div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="google-body-small text-muted-foreground mb-4">
              Sync with HubSpot, Salesforce, Zendesk, and other customer data platforms
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="google-body-small text-muted-foreground">Contact sync</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="google-body-small text-muted-foreground">Ticket creation</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="google-body-small text-muted-foreground">Pipeline management</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
          <CardHeader className="rounded-t-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <div className="google-headline-small text-foreground">Workflow Tools</div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="google-body-small text-muted-foreground mb-4">
              Automate workflows with Slack, Zapier, webhooks, and custom APIs
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="google-body-small text-muted-foreground">Team notifications</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="google-body-small text-muted-foreground">Custom automation</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="google-body-small text-muted-foreground">Webhook triggers</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
