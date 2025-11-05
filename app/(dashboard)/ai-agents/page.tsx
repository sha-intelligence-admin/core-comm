"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddAgentModal } from "@/components/add-agent-modal"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  Phone,
  MessageSquare,
  Mail,
  Plus,
  Plug,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Settings,
  BarChart3,
  BookOpen,
  Key,
  Users,
} from "lucide-react"

const topStats = [
  {
    label: "Total Agents",
    value: "3",
    description: "Configured agents",
    icon: Bot,
  },
  {
    label: "Active Conversations",
    value: "12",
    description: "Real-time interactions",
    icon: Activity,
  },
  {
    label: "Average Response Time",
    value: "1.4s",
    description: "System speed",
    icon: Clock,
  },
  {
    label: "System Health",
    value: "Normal",
    description: "Service status",
    icon: CheckCircle,
    healthy: true,
  },
]

const voiceMetrics = [
  { label: "Calls Today", value: "31" },
  { label: "Avg Call Duration", value: "2m 17s" },
  { label: "Success Rate", value: "94%" },
]

const messagingMetrics = [
  { label: "Chats Today", value: "148" },
  { label: "CSAT Score", value: "4.7/5" },
  { label: "Automation Rate", value: "82%" },
]

const emailMetrics = [
  { label: "Emails Processed Today", value: "62" },
  { label: "Auto-Replied", value: "48" },
  { label: "Response Accuracy", value: "91%" },
]

const voiceUseCases = [
  "Customer support hotline",
  "Appointment reminders",
  "Automated phone surveys",
]

const messagingUseCases = [
  "Customer inquiries",
  "Sales & lead qualification",
  "FAQ automation",
]

const emailUseCases = [
  "Reply suggestion drafts",
  "Ticket routing to departments",
  "Lead classification",
]

const footerTools = [
  { label: "Agent Performance Analytics", icon: BarChart3 },
  { label: "Retraining & Knowledge Base", icon: BookOpen },
  { label: "API Keys & Webhooks", icon: Key },
  { label: "User Access and Permissions", icon: Users },
]

export default function AIAgentsPage() {
  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 max-w-lg">
          <h1 className="google-headline-medium">AI Agents</h1>
          <p className="google-body-medium text-muted-foreground">
            Create, manage, and monitor your automation agents across voice, messaging, and email.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddAgentModal>
            <Button className="h-11 rounded-sm px-6 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </AddAgentModal>
          <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
            <Plug className="mr-2 h-4 w-4" />
            Connect Integration
          </Button>
          <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
            <FileText className="mr-2 h-4 w-4" />
            Open Logs
          </Button>
        </div>
      </div>

      <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
        <CardHeader className="rounded-t-sm">
          <div className="google-headline-small">Quick overview</div>
          <div className="google-body-medium text-muted-foreground">
            Real-time snapshot of agent activity and system performance
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {topStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-sm border border-input bg-metricCard p-4 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5 text-primary" />
                  {stat.healthy && (
                    <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-500">
                      ✓ Active
                    </Badge>
                  )}
                </div>
                <div className="mt-3">
                  <div className="google-headline-small text-foreground">{stat.value}</div>
                  <div className="google-body-small text-muted-foreground">{stat.label}</div>
                  <div className="google-body-small text-muted-foreground/70 mt-1">{stat.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
          <CardHeader className="rounded-t-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="google-headline-small flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Voice Agents
                </div>
                <div className="google-body-medium text-muted-foreground">
                  Handles inbound & outbound calls through Twilio, VoIP, or SIP
                </div>
              </div>
              <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-500">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <div className="google-title-small text-foreground mb-2">Connected Providers</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                      Twilio
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                      Asterisk SIP
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="google-title-small text-foreground mb-2">Use Cases</div>
                  <div className="grid gap-2">
                    {voiceUseCases.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="google-body-small text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="google-title-small text-foreground mb-2">Controls</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" size="sm" className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary">
                      <Settings className="mr-2 h-3 w-3" />
                      Configure Call Flow
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary">
                      <FileText className="mr-2 h-3 w-3" />
                      Edit IVR Script
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary">
                      <Bot className="mr-2 h-3 w-3" />
                      Voice Personality
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary">
                      <BarChart3 className="mr-2 h-3 w-3" />
                      View Analytics
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="google-title-small text-foreground mb-2">Today's Metrics</div>
                  <div className="grid gap-2">
                    {voiceMetrics.map((metric) => (
                      <div key={metric.label} className="flex items-center justify-between rounded-sm border border-input bg-muted/40 p-3">
                        <span className="google-body-small text-muted-foreground">{metric.label}</span>
                        <span className="google-title-small text-foreground">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
          <CardHeader className="rounded-t-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="google-headline-small flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Messaging Agents
                </div>
                <div className="google-body-medium text-muted-foreground">
                  Handles real-time chat on WhatsApp, Telegram, Messenger, and websites
                </div>
              </div>
              <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-500">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <div className="google-title-small text-foreground mb-2">Connected Channels</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                      WhatsApp
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                      Website Chat Widget
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="google-title-small text-foreground mb-2">Use Cases</div>
                  <div className="grid gap-2">
                    {messagingUseCases.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="google-body-small text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="google-title-small text-foreground mb-2">Controls</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" size="sm" className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary">
                      <Plug className="mr-2 h-3 w-3" />
                      Connect Channels
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary">
                      <Bot className="mr-2 h-3 w-3" />
                      Train Intent Models
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary">
                      <FileText className="mr-2 h-3 w-3" />
                      Manage Templates
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary">
                      <MessageSquare className="mr-2 h-3 w-3" />
                      View Chat Logs
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="google-title-small text-foreground mb-2">Today's Metrics</div>
                  <div className="grid gap-2">
                    {messagingMetrics.map((metric) => (
                      <div key={metric.label} className="flex items-center justify-between rounded-sm border border-input bg-muted/40 p-3">
                        <span className="google-body-small text-muted-foreground">{metric.label}</span>
                        <span className="google-title-small text-foreground">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
          <CardHeader className="rounded-t-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="google-headline-small flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email Agents
                </div>
                <div className="google-body-medium text-muted-foreground">
                  Automates email replies, categorization, spam detection, and smart routing
                </div>
              </div>
              <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-500">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <div className="google-title-small text-foreground mb-2">Connected Inbox</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                      support@example.com
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="google-title-small text-foreground mb-2">Use Cases</div>
                  <div className="grid gap-2">
                    {emailUseCases.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="google-body-small text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="google-title-small text-foreground mb-2">Controls</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" size="sm" className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary">
                      <Bot className="mr-2 h-3 w-3" />
                      Train Classifier
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary">
                      <Settings className="mr-2 h-3 w-3" />
                      Auto-Reply Rules
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary">
                      <TrendingUp className="mr-2 h-3 w-3" />
                      Sentiment Model
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary">
                      <Mail className="mr-2 h-3 w-3" />
                      View Email Queue
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="google-title-small text-foreground mb-2">Today's Metrics</div>
                  <div className="grid gap-2">
                    {emailMetrics.map((metric) => (
                      <div key={metric.label} className="flex items-center justify-between rounded-sm border border-input bg-muted/40 p-3">
                        <span className="google-body-small text-muted-foreground">{metric.label}</span>
                        <span className="google-title-small text-foreground">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
        <CardHeader className="rounded-t-sm">
          <div className="google-headline-small">Agent management tools</div>
          <div className="google-body-medium text-muted-foreground">
            Access advanced configuration, training, and monitoring capabilities
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {footerTools.map((tool) => (
              <Button
                key={tool.label}
                variant="outline"
                className="h-auto flex-col items-start gap-2 rounded-sm border-input bg-muted/40 p-4 text-left hover:border-primary hover:bg-muted"
              >
                <tool.icon className="h-5 w-5 text-primary" />
                <span className="google-body-small text-muted-foreground">{tool.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
