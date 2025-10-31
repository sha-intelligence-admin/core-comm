"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useUserProfile } from "@/hooks/use-user-profile"
import { useAssistants } from "@/hooks/use-assistants"
import { useKnowledgeBases } from "@/hooks/use-knowledge-bases"
import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Upload, Bot, BookOpen } from "lucide-react"

export default function SettingsPage() {
  const { profile, loading, getInitials, updateProfile } = useUserProfile()
  const { assistants, isLoading: assistantsLoading } = useAssistants()
  const { knowledgeBases, isLoading: kbLoading } = useKnowledgeBases()

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    avatar_url: ""
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Voice settings state
  const [selectedAssistant, setSelectedAssistant] = useState<string>("")

  // Knowledge base state - track which KBs are enabled
  const [enabledKBs, setEnabledKBs] = useState<Record<string, boolean>>({})

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        avatar_url: profile.avatar_url || ""
      })
    }
  }, [profile])

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProfileUpdate = async () => {
    setIsUpdating(true)
    setUpdateMessage(null)

    try {
      const result = await updateProfile(formData)
      
      if (result?.error) {
        setUpdateMessage({ type: 'error', message: result.error })
      } else {
        setUpdateMessage({ type: 'success', message: 'Profile updated successfully!' })
        setTimeout(() => setUpdateMessage(null), 3000)
      }
    } catch (error) {
      setUpdateMessage({ type: 'error', message: 'Failed to update profile' })
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand/10 to-transparent p-6 rounded-2xl border border-brand/20">
        <h1 className="text-3xl font-bold tracking-tight text-brand">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      {updateMessage && (
        <Alert className={updateMessage.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className={updateMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {updateMessage.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-brand/5 border border-brand/20">
          <TabsTrigger
            value="profile"
            className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-white hover:bg-brand/10 hover:text-brand transition-all duration-200"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="voice"
            className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-white hover:bg-brand/10 hover:text-brand transition-all duration-200"
          >
            Voice
          </TabsTrigger>
          <TabsTrigger
            value="knowledge"
            className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-white hover:bg-brand/10 hover:text-brand transition-all duration-200"
          >
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-white hover:bg-brand/10 hover:text-brand transition-all duration-200"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="rounded-2xl border-brand/20 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-r from-brand/5 to-transparent group-hover:from-brand/10 transition-all duration-300 rounded-t-2xl">
              <CardTitle className="text-brand group-hover:text-brand/80 transition-colors duration-200">
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 hover:scale-110 hover:ring-4 hover:ring-brand/30 transition-all duration-300">
                  <AvatarImage src={profile?.avatar_url || "/placeholder-40x40.png"} />
                  <AvatarFallback className="bg-brand/10 text-brand text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    variant="outline"
                    className="rounded-xl bg-brand/5 border-brand/30 hover:bg-brand hover:text-white hover:scale-105 transition-all duration-200"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <Separator className="bg-brand/20" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-brand/80 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20 hover:border-brand/40 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-brand/80 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="rounded-xl border-brand/20 bg-muted text-muted-foreground"
                  />
                  <p className="text-sm text-muted-foreground">Email cannot be changed here. Contact support if needed.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-brand/80 font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20 hover:border-brand/40 transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-brand/80 font-medium">
                    Role
                  </Label>
                  <Input
                    id="role"
                    value={profile?.role || "user"}
                    disabled
                    className="rounded-xl border-brand/20 bg-muted text-muted-foreground capitalize"
                  />
                </div>
              </div>

              <Button 
                onClick={handleProfileUpdate}
                disabled={isUpdating}
                className="rounded-xl bg-brand hover:bg-brand/90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isUpdating && <LoadingSpinner className="mr-2" size="sm" />}
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <Card className="rounded-2xl border-brand/20 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-r from-brand/5 to-transparent group-hover:from-brand/10 transition-all duration-300 rounded-t-2xl">
              <CardTitle className="text-brand group-hover:text-brand/80 transition-colors duration-200">
                Voice Assistants
              </CardTitle>
              <CardDescription>Manage your voice assistants and their configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {assistantsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : assistants.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">No voice assistants configured yet</p>
                    <p className="text-sm text-muted-foreground">Create one in the Voice Agents page</p>
                  </div>
                  <Button
                    onClick={() => window.location.href = '/voice-agents'}
                    className="rounded-xl bg-brand hover:bg-brand/90"
                  >
                    Go to Voice Agents
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="assistant" className="text-brand/80 font-medium">
                      Default Assistant
                    </Label>
                    <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                      <SelectTrigger className="rounded-xl border-brand/20 hover:border-brand/40 focus:border-brand transition-all duration-200">
                        <SelectValue placeholder="Select an assistant" />
                      </SelectTrigger>
                      <SelectContent>
                        {assistants.map((assistant: any) => (
                          <SelectItem
                            key={assistant.id}
                            value={assistant.id}
                            className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                          >
                            {assistant.name} {assistant.is_active ? "(Active)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAssistant && (() => {
                    const assistant = assistants.find((a: any) => a.id === selectedAssistant)
                    return assistant ? (
                      <div className="space-y-4 p-4 rounded-xl border border-brand/20 bg-brand/5">
                        <h4 className="font-medium text-brand">Assistant Configuration</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Model</p>
                            <p className="font-medium">{assistant.model_config?.model || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Voice Provider</p>
                            <p className="font-medium">{assistant.voice_config?.provider || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Voice ID</p>
                            <p className="font-medium">{assistant.voice_config?.voice_id || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Status</p>
                            <p className="font-medium">{assistant.is_active ? "Active" : "Inactive"}</p>
                          </div>
                        </div>
                      </div>
                    ) : null
                  })()}

                  <Button
                    onClick={() => window.location.href = '/voice-agents'}
                    variant="outline"
                    className="rounded-xl border-brand/30 hover:bg-brand/10 hover:text-brand hover:border-brand transition-all duration-200"
                  >
                    Manage Assistants
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <Card className="rounded-2xl border-brand/20 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-r from-brand/5 to-transparent group-hover:from-brand/10 transition-all duration-300 rounded-t-2xl">
              <CardTitle className="text-brand group-hover:text-brand/80 transition-colors duration-200">
                Knowledge Base Sources
              </CardTitle>
              <CardDescription>Enable or disable retrieval from your knowledge sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {kbLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : knowledgeBases.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">No knowledge bases configured yet</p>
                    <p className="text-sm text-muted-foreground">Create one in the Knowledge Base page</p>
                  </div>
                  <Button
                    onClick={() => window.location.href = '/knowledge-base'}
                    className="rounded-xl bg-brand hover:bg-brand/90"
                  >
                    Go to Knowledge Base
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {knowledgeBases.map((kb: any) => (
                      <div
                        key={kb.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-brand/20 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300 group"
                      >
                        <div className="flex-1">
                          <Label
                            htmlFor={`kb-${kb.id}`}
                            className="font-medium group-hover:text-brand transition-colors duration-200 cursor-pointer"
                          >
                            {kb.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {kb.description || "No description"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {kb.file_count || 0} files
                          </p>
                        </div>
                        <Switch
                          id={`kb-${kb.id}`}
                          checked={enabledKBs[kb.id] !== false}
                          onCheckedChange={(checked) =>
                            setEnabledKBs(prev => ({ ...prev, [kb.id]: checked }))
                          }
                          className="data-[state=checked]:bg-brand"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.location.href = '/knowledge-base'}
                      variant="outline"
                      className="rounded-xl border-brand/30 hover:bg-brand/10 hover:text-brand hover:border-brand transition-all duration-200"
                    >
                      Manage Knowledge Bases
                    </Button>
                    <Button
                      onClick={() => {
                        setUpdateMessage({ type: 'success', message: 'Knowledge base preferences saved!' })
                        setTimeout(() => setUpdateMessage(null), 3000)
                      }}
                      className="rounded-xl bg-brand hover:bg-brand/90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Save Preferences
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="rounded-2xl border-brand/20 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-r from-brand/5 to-transparent group-hover:from-brand/10 transition-all duration-300 rounded-t-2xl">
              <CardTitle className="text-brand group-hover:text-brand/80 transition-colors duration-200">
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-brand/20 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300 group">
                  <div>
                    <Label
                      htmlFor="email-notifications"
                      className="font-medium group-hover:text-brand transition-colors duration-200"
                    >
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive email alerts for important events</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked className="data-[state=checked]:bg-brand" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-brand/20 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300 group">
                  <div>
                    <Label
                      htmlFor="call-alerts"
                      className="font-medium group-hover:text-brand transition-colors duration-200"
                    >
                      Call Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">Get notified when calls require attention</p>
                  </div>
                  <Switch id="call-alerts" defaultChecked className="data-[state=checked]:bg-brand" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-brand/20 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300 group">
                  <div>
                    <Label
                      htmlFor="system-updates"
                      className="font-medium group-hover:text-brand transition-colors duration-200"
                    >
                      System Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">Notifications about system maintenance and updates</p>
                  </div>
                  <Switch id="system-updates" className="data-[state=checked]:bg-brand" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-brand/20 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300 group">
                  <div>
                    <Label
                      htmlFor="integration-alerts"
                      className="font-medium group-hover:text-brand transition-colors duration-200"
                    >
                      Integration Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">Alerts when integrations go offline or fail</p>
                  </div>
                  <Switch id="integration-alerts" defaultChecked className="data-[state=checked]:bg-brand" />
                </div>
              </div>

              <Button className="rounded-xl bg-brand hover:bg-brand/90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
