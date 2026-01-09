"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddAgentModal } from "@/components/add-agent-modal"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useVoiceAgents } from "@/hooks/use-voice-agents"
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

// Coming Soon Configuration
const comingSoonConfig = {
  messaging: true,
  email: true,
}



const voiceUseCases = [
  "Communications hotline",
  "Appointment reminders",
  "Automated phone surveys",
]

const footerTools = [
  { label: "Agent Performance Analytics", icon: BarChart3 },
  { label: "Retraining & Knowledge Base", icon: BookOpen },
  { label: "API Keys & Webhooks", icon: Key },
  { label: "User Access and Permissions", icon: Users },
]

// Coming Soon Component
const ComingSoonCard = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionIcon: ActionIcon 
}: { 
  icon: any
  title: string
  description: string
  actionLabel: string
  actionIcon: any
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Icon className="h-12 w-12 text-muted-foreground/40 mb-4" />
    <h3 className="google-headline-small text-foreground mb-2">{title}</h3>
    <p className="google-body-medium text-muted-foreground mb-4 max-w-md">
      {description}
    </p>
    <Button variant="outline" className="h-11 rounded-sm px-6">
      <ActionIcon className="mr-2 h-4 w-4" />
      {actionLabel}
    </Button>
  </div>
)

export default function AIAgentsPage() {
  const { agents: voiceAgents, loading: voiceLoading } = useVoiceAgents()

  // Calculate real voice metrics from backend data
  const activeVoiceAgents = voiceAgents.filter(a => a.status === 'active')
  const totalCallsToday = voiceAgents.reduce((sum, a) => sum + (a.total_calls || 0), 0)
  const avgDuration = voiceAgents.length > 0 
    ? (voiceAgents.reduce((sum, a) => sum + (a.total_minutes || 0), 0) / voiceAgents.length).toFixed(1)
    : '0'
  const avgSuccessRate = voiceAgents.length > 0
    ? (voiceAgents.reduce((sum, a) => sum + (a.success_rate || 0), 0) / voiceAgents.length).toFixed(0)
    : '0'

  const voiceMetrics = [
    { label: "Calls Today", value: totalCallsToday.toString() },
    { label: "Avg Call Duration", value: `${avgDuration}m` },
    { label: "Success Rate", value: `${avgSuccessRate}%` },
  ]

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
          {voiceLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-sm border border-input bg-metricCard p-4 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-3">
                  <div className="google-headline-small text-foreground">{voiceAgents.length}</div>
                  <div className="google-body-small text-muted-foreground">Total Voice Agents</div>
                  <div className="google-body-small text-muted-foreground/70 mt-1">Configured agents</div>
                </div>
              </div>

              <div className="rounded-sm border border-input bg-metricCard p-4 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-3">
                  <div className="google-headline-small text-foreground">{activeVoiceAgents.length}</div>
                  <div className="google-body-small text-muted-foreground">Active Agents</div>
                  <div className="google-body-small text-muted-foreground/70 mt-1">Currently running</div>
                </div>
              </div>

              <div className="rounded-sm border border-input bg-metricCard p-4 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-3">
                  <div className="google-headline-small text-foreground">{totalCallsToday}</div>
                  <div className="google-body-small text-muted-foreground">Total Calls</div>
                  <div className="google-body-small text-muted-foreground/70 mt-1">All-time</div>
                </div>
              </div>

              <div className="rounded-sm border border-input bg-metricCard p-4 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  {voiceAgents.length > 0 && (
                    <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-500">
                      ✓ Active
                    </Badge>
                  )}
                </div>
                <div className="mt-3">
                  <div className="google-headline-small text-foreground">{voiceAgents.length > 0 ? 'Normal' : 'No Agents'}</div>
                  <div className="google-body-small text-muted-foreground">System Health</div>
                  <div className="google-body-small text-muted-foreground/70 mt-1">Service status</div>
                </div>
              </div>
            </div>
          )}
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
                {activeVoiceAgents.length > 0 ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {voiceLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : voiceAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bot className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="google-headline-small text-foreground mb-2">No voice agents yet</h3>
                <p className="google-body-medium text-muted-foreground mb-4 max-w-md">
                  Create your first AI voice agent to handle calls automatically
                </p>
                <AddAgentModal>
                  <Button className="h-11 rounded-sm px-6 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Voice Agent
                  </Button>
                </AddAgentModal>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Agents List */}
                <div className="space-y-3">
                  <div className="google-title-small text-foreground">Your Voice Agents</div>
                  <div className="grid gap-3">
                    {voiceAgents.map((agent) => (
                      <div 
                        key={agent.id} 
                        className="rounded-sm border border-input bg-muted/40 p-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4 text-primary" />
                              <h4 className="google-title-small text-foreground">{agent.name}</h4>
                              <Badge 
                                variant="outline" 
                                className={`rounded-full border-0 ${
                                  agent.status === 'active' 
                                    ? 'bg-green-500/20 text-green-500' 
                                    : agent.status === 'training'
                                    ? 'bg-blue-500/20 text-blue-500'
                                    : agent.status === 'error'
                                    ? 'bg-red-500/20 text-red-500'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {agent.status}
                              </Badge>
                            </div>
                            {agent.description && (
                              <p className="google-body-small text-muted-foreground">{agent.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="google-body-small text-muted-foreground">
                                <Phone className="h-3 w-3 inline mr-1" />
                                {agent.total_calls} calls
                              </span>
                              <span className="google-body-small text-muted-foreground">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {agent.total_minutes.toFixed(1)}m
                              </span>
                              <span className="google-body-small text-muted-foreground">
                                <TrendingUp className="h-3 w-3 inline mr-1" />
                                {agent.success_rate.toFixed(0)}% success
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-sm border-input">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics Grid */}
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
                      <div className="google-title-small text-foreground mb-2">Aggregate Metrics</div>
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
              </div>
            )}
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
              {comingSoonConfig.messaging && (
                <Badge variant="outline" className="rounded-full border-0 bg-muted text-muted-foreground">
                  Coming Soon
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {comingSoonConfig.messaging ? (
              <ComingSoonCard
                icon={MessageSquare}
                title="Messaging agents configuration"
                description="Configure and manage your messaging agents on the Messaging Channels page"
                actionLabel="Go to Messaging Channels"
                actionIcon={MessageSquare}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="google-headline-small text-foreground mb-2">Messaging agents configuration</h3>
                <p className="google-body-medium text-muted-foreground mb-4 max-w-md">
                  Configure and manage your messaging agents on the Messaging Channels page
                </p>
                <Button variant="outline" className="h-11 rounded-sm px-6">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Go to Messaging Channels
                </Button>
              </div>
            )}
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
              {comingSoonConfig.email && (
                <Badge variant="outline" className="rounded-full border-0 bg-muted text-muted-foreground">
                  Coming Soon
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {comingSoonConfig.email ? (
              <ComingSoonCard
                icon={Mail}
                title="Email agents configuration"
                description="Configure and manage your email agents on the Email Accounts page"
                actionLabel="Go to Email Accounts"
                actionIcon={Mail}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="google-headline-small text-foreground mb-2">Email agents configuration</h3>
                <p className="google-body-medium text-muted-foreground mb-4 max-w-md">
                  Configure and manage your email agents on the Email Accounts page
                </p>
                <Button variant="outline" className="h-11 rounded-sm px-6">
                  <Mail className="mr-2 h-4 w-4" />
                  Go to Email Accounts
                </Button>
              </div>
            )}
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
