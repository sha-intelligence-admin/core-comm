"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAssistants } from "@/hooks/use-assistants"
import { useKnowledgeBases } from "@/hooks/use-knowledge-bases"
import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function SettingsPage() {
  const { assistants, isLoading: assistantsLoading } = useAssistants()
  const { knowledgeBases, isLoading: kbLoading } = useKnowledgeBases()

  // Voice settings state
  const [selectedAssistant, setSelectedAssistant] = useState<string>("")

  // Knowledge base state - track which KBs are enabled
  const [enabledKBs, setEnabledKBs] = useState<Record<string, boolean>>({})

  // Initialize KB enabled state
  useEffect(() => {
    if (knowledgeBases.length > 0) {
      const initialState: Record<string, boolean> = {}
      knowledgeBases.forEach((kb: any) => {
        initialState[kb.id] = true // Default all to enabled
      })
      setEnabledKBs(initialState)
    }
  }, [knowledgeBases])

  // Set default assistant
  useEffect(() => {
    if (assistants.length > 0 && !selectedAssistant) {
      const defaultAssistant = assistants.find((a: any) => a.is_active)
      if (defaultAssistant) {
        setSelectedAssistant(defaultAssistant.id)
      }
    }
  }, [assistants, selectedAssistant])

  if (assistantsLoading || kbLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="google-headline-medium">Settings</h1>
          <p className="google-body-medium text-muted-foreground">
            Manage your voice configuration, knowledge sources, and notifications
          </p>
        </div>
      </div>

      <Tabs defaultValue="voice" className="space-y-6 ">
        <TabsList className="flex w-full gap-2 rounded-sm border border-input bg-muted/40 p-2 sm:w-auto">
          <TabsTrigger
            value="voice"
            className="rounded-sm px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-muted-foreground"
          >
            Voice
          </TabsTrigger>
          <TabsTrigger
            value="knowledge"
            className="rounded-sm px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-muted-foreground"
          >
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-sm px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-muted-foreground"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-6">
          <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
            <CardHeader className="space-y-2">
              <CardTitle className="google-headline-small">Voice Settings</CardTitle>
              <CardDescription className="google-body-medium text-muted-foreground">
                Configure text-to-speech and voice recognition preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="voice" className="google-body-small text-muted-foreground">
                    Voice Model
                  </Label>
                  <Select>
                    <SelectTrigger className="rounded-sm border-input focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue placeholder="Select voice model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neural-1">Neural Voice 1 (Female)</SelectItem>
                      <SelectItem value="neural-2">Neural Voice 2 (Male)</SelectItem>
                      <SelectItem value="standard-1">Standard Voice 1</SelectItem>
                      <SelectItem value="standard-2">Standard Voice 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="speed" className="google-body-small text-muted-foreground">
                    Speech Speed
                  </Label>
                  <Select>
                    <SelectTrigger className="rounded-sm border-input focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue placeholder="Select speech speed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow (0.8x)</SelectItem>
                      <SelectItem value="normal">Normal (1.0x)</SelectItem>
                      <SelectItem value="fast">Fast (1.2x)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="google-body-small text-muted-foreground">
                    Language
                  </Label>
                  <Select>
                    <SelectTrigger className="rounded-sm border-input focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                >
                  Test Voice
                </Button>
                <Button className="rounded-sm border border-primary bg-primary text-white hover:bg-primary/90">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
            <CardHeader className="space-y-2">
              <CardTitle className="google-headline-small">Knowledge Base Sources</CardTitle>
              <CardDescription className="google-body-medium text-muted-foreground">
                Enable or disable retrieval from specific knowledge sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  id: "kb-docs",
                  title: "Company Documentation",
                  description: "Internal company policies and procedures",
                  defaultChecked: true,
                },
                {
                  id: "kb-faq",
                  title: "FAQ Database",
                  description: "Frequently asked questions and answers",
                  defaultChecked: true,
                },
                {
                  id: "kb-products",
                  title: "Product Information",
                  description: "Product specifications and features",
                  defaultChecked: true,
                },
                {
                  id: "kb-external",
                  title: "External Resources",
                  description: "Third-party documentation and resources",
                  defaultChecked: false,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/50 hover:bg-muted"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor={item.id} className="google-title-small text-foreground">
                        {item.title}
                      </Label>
                      <p className="google-body-small text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch id={item.id} defaultChecked={item.defaultChecked} className="data-[state=checked]:bg-primary" />
                  </div>
                </div>
              ))}

              <Button className="rounded-sm border border-primary bg-primary text-white hover:bg-primary/90">
                Update Knowledge Sources
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
            <CardHeader className="space-y-2">
              <CardTitle className="google-headline-small">Notification Preferences</CardTitle>
              <CardDescription className="google-body-medium text-muted-foreground">
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  id: "email-notifications",
                  title: "Email Notifications",
                  description: "Receive email alerts for important events",
                  defaultChecked: true,
                },
                {
                  id: "call-alerts",
                  title: "Call Alerts",
                  description: "Get notified when calls require attention",
                  defaultChecked: true,
                },
                {
                  id: "system-updates",
                  title: "System Updates",
                  description: "Notifications about system maintenance and updates",
                  defaultChecked: false,
                },
                {
                  id: "integration-alerts",
                  title: "Integration Alerts",
                  description: "Alerts when integrations go offline or fail",
                  defaultChecked: true,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/50 hover:bg-muted"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor={item.id} className="google-title-small text-foreground">
                        {item.title}
                      </Label>
                      <p className="google-body-small text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch id={item.id} defaultChecked={item.defaultChecked} className="data-[state=checked]:bg-primary" />
                  </div>
                </div>
              ))}

              <Button className="rounded-sm border border-primary bg-primary text-white hover:bg-primary/90">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
