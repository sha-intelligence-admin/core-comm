"use client"

import { IntegrationCard } from "@/components/integration-card"
import { AddIntegrationModal } from "@/components/add-integration-modal"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

const communicationProviders = [
  {
    service: "Twilio",
    purpose: "Voice call routing and SMS delivery",
    icon: Phone,
    status: "connected",
    notes: "Primary voice gateway for all regions",
  },
  {
    service: "Gmail",
    purpose: "Email inbox automation",
    icon: Mail,
    status: "connected",
    notes: "OAuth-authenticated for support@corecomm.io",
  },
  {
    service: "Outlook",
    purpose: "Email inbox automation",
    icon: Mail,
    status: "connected",
    notes: "OAuth-authenticated for billing@corecomm.io",
  },
  {
    service: "WhatsApp Business API",
    purpose: "Messaging channel for customer support",
    icon: MessageSquare,
    status: "connected",
    notes: "Connected to +234 701 555 9900",
  },
  {
    service: "Telegram Bot API",
    purpose: "Messaging channel for lead qualification",
    icon: MessageSquare,
    status: "connected",
    notes: "@corecomm_live_bot",
  },
]

const crmIntegrations = [
  {
    service: "HubSpot",
    purpose: "CRM contact sync and pipeline management",
    icon: Database,
    status: "connected",
    notes: "Bi-directional sync every 15 minutes",
  },
  {
    service: "Zendesk",
    purpose: "Support ticket creation and tracking",
    icon: Server,
    status: "connected",
    notes: "Auto-creates tickets from escalated conversations",
  },
  {
    service: "Salesforce",
    purpose: "Lead and opportunity management",
    icon: Database,
    status: "pending",
    notes: "Awaiting admin approval",
  },
]

const workflowTools = [
  {
    service: "Slack",
    purpose: "Team notifications and alerts",
    icon: Bell,
    status: "connected",
    notes: "Posts to #customer-support and #escalations",
  },
  {
    service: "Zapier",
    purpose: "Custom workflow automation",
    icon: Zap,
    status: "connected",
    notes: "5 active zaps running",
  },
]

const syncedData = [
  "Call transcripts and recordings",
  "Chat conversation histories",
  "Email threads and attachments",
  "Customer sentiment scores and feedback",
  "AI agent response classifications",
  "Support ticket status and priority levels",
  "Contact information and interaction timelines",
  "Performance metrics and analytics data",
]

const setupSteps = [
  {
    step: "Select integration type",
    detail: "Choose from Communication Providers, CRM Systems, or Workflow Tools",
  },
  {
    step: "Authenticate connection",
    detail: "Complete OAuth flow or provide API credentials securely",
  },
  {
    step: "Configure sync settings",
    detail: "Set data mapping rules, sync frequency, and field permissions",
  },
  {
    step: "Test connection",
    detail: "Verify data flow and validate authentication before activation",
  },
  {
    step: "Activate integration",
    detail: "Enable real-time sync and monitor connection health dashboard",
  },
]

const mockIntegrations = [
  {
    id: "1",
    name: "Twilio Voice Gateway",
    type: "Communication",
    endpoint: "https://api.twilio.com/2010-04-01",
    status: "connected" as const,
    lastSync: "2 minutes ago",
    icon: Phone,
  },
  {
    id: "2",
    name: "HubSpot CRM",
    type: "Customer Data",
    endpoint: "https://api.hubapi.com/crm/v3",
    status: "connected" as const,
    lastSync: "5 minutes ago",
    icon: Database,
  },
  {
    id: "3",
    name: "Slack Notifications",
    type: "Workflow",
    endpoint: "https://hooks.slack.com/services/...",
    status: "connected" as const,
    lastSync: "1 hour ago",
    icon: Bell,
  },
  {
    id: "4",
    name: "Gmail Support Inbox",
    type: "Communication",
    endpoint: "https://gmail.googleapis.com/gmail/v1",
    status: "connected" as const,
    lastSync: "30 seconds ago",
    icon: Mail,
  },
  {
    id: "5",
    name: "WhatsApp Business",
    type: "Communication",
    endpoint: "https://graph.facebook.com/v18.0",
    status: "connected" as const,
    lastSync: "3 minutes ago",
    icon: MessageSquare,
  },
  {
    id: "6",
    name: "Zendesk Support",
    type: "Customer Data",
    endpoint: "https://corecomm.zendesk.com/api/v2",
    status: "connected" as const,
    lastSync: "12 minutes ago",
    icon: Server,
  },
]

export default function IntegrationsPage() {
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
          <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
            <RefreshCw className="mr-2 h-4 w-4" />
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mockIntegrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
        <CardHeader className="rounded-t-sm">
          <div className="google-headline-small text-foreground">Communication providers</div>
          <div className="google-body-medium text-muted-foreground">
            Voice, email, and messaging platform integrations
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {communicationProviders.map((provider) => (
              <div
                key={provider.service}
                className="flex flex-col gap-3 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex flex-1 items-center gap-3">
                  <provider.icon className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="google-title-small text-foreground">{provider.service}</div>
                    <div className="google-body-small text-muted-foreground mt-1">{provider.purpose}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-600">
                    {/* <CheckCircle className="mr-1 h-3 w-3" /> */}
                    {provider.status}
                  </Badge>
                  <span className="google-body-small text-muted-foreground">{provider.notes}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
        <CardHeader className="rounded-t-sm">
          <div className="google-headline-small text-foreground">CRM & support integrations</div>
          <div className="google-body-medium text-muted-foreground">
            Customer relationship management and ticketing systems
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {crmIntegrations.map((crm) => (
              <div
                key={crm.service}
                className="flex flex-col gap-3 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex flex-1 items-center gap-3">
                  <crm.icon className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="google-title-small text-foreground">{crm.service}</div>
                    <div className="google-body-small text-muted-foreground mt-1">{crm.purpose}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`rounded-full border-0 ${crm.status === "connected"
                        ? "bg-green-500/20 text-green-600"
                        : "bg-yellow-500/20 text-yellow-600"
                      }`}
                  >
                    {crm.status}
                  </Badge>
                  <span className="google-body-small text-muted-foreground">{crm.notes}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
        <CardHeader className="rounded-t-sm">
          <div className="google-headline-small text-foreground">Workflow & notification tools</div>
          <div className="google-body-medium text-muted-foreground">
            Team collaboration and automation platforms
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {workflowTools.map((tool) => (
              <div
                key={tool.service}
                className="flex flex-col gap-3 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex flex-1 items-center gap-3">
                  <tool.icon className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="google-title-small text-foreground">{tool.service}</div>
                    <div className="google-body-small text-muted-foreground mt-1">{tool.purpose}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-600">
                    {/* <CheckCircle className="mr-1 h-3 w-3" /> */}
                    {tool.status}
                  </Badge>
                  <span className="google-body-small text-muted-foreground">{tool.notes}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
        <CardHeader className="rounded-t-sm">
          <div className="google-headline-small text-foreground">Data synchronization</div>
          <div className="google-body-medium text-muted-foreground">
            Information shared across integrated systems
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {syncedData.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="google-body-small text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
        <CardHeader className="rounded-t-sm">
          <div className="google-headline-small text-foreground">Setup flow</div>
          <div className="google-body-medium text-muted-foreground">
            Step-by-step guide to connecting new integrations
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {setupSteps.map((item, index) => (
              <div
                key={item.step}
                className="rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
              >
                <div className="flex items-start gap-3">
                  <span className="google-title-small text-primary w-6">0{index + 1}</span>
                  <div className="flex-1">
                    <div className="google-title-small text-foreground">{item.step}</div>
                    <p className="google-body-small text-muted-foreground mt-1">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
