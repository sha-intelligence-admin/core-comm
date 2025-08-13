"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mic, Database, Save } from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@company.com",
    avatar: "",
  })

  const [voiceSettings, setVoiceSettings] = useState({
    voice: "alloy",
    speed: "1.0",
    language: "en-US",
  })

  const [knowledgeBases, setKnowledgeBases] = useState([
    { id: "1", name: "Product Documentation", enabled: true },
    { id: "2", name: "FAQ Database", enabled: true },
    { id: "3", name: "Company Policies", enabled: false },
    { id: "4", name: "Technical Manuals", enabled: true },
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and platform preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="h-4 w-4" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2">
            <Database className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Avatar</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Change Password</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                </div>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Configure the AI voice for customer interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="voice">Voice Model</Label>
                  <Select
                    value={voiceSettings.voice}
                    onValueChange={(value) => setVoiceSettings({ ...voiceSettings, voice: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                      <SelectItem value="echo">Echo (Male)</SelectItem>
                      <SelectItem value="fable">Fable (British)</SelectItem>
                      <SelectItem value="onyx">Onyx (Deep)</SelectItem>
                      <SelectItem value="nova">Nova (Female)</SelectItem>
                      <SelectItem value="shimmer">Shimmer (Soft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="speed">Speech Speed</Label>
                  <Select
                    value={voiceSettings.speed}
                    onValueChange={(value) => setVoiceSettings({ ...voiceSettings, speed: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.75">0.75x (Slow)</SelectItem>
                      <SelectItem value="1.0">1.0x (Normal)</SelectItem>
                      <SelectItem value="1.25">1.25x (Fast)</SelectItem>
                      <SelectItem value="1.5">1.5x (Very Fast)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={voiceSettings.language}
                    onValueChange={(value) => setVoiceSettings({ ...voiceSettings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                      <SelectItem value="de-DE">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Button variant="outline">Test Voice</Button>
                <p className="text-sm text-muted-foreground">Click to hear a sample of the selected voice settings</p>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Voice Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Knowledge Base Sources</CardTitle>
              <CardDescription>Enable or disable specific knowledge bases for AI retrieval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {knowledgeBases.map((kb) => (
                <div key={kb.id} className="flex items-center justify-between p-4 border rounded-xl">
                  <div>
                    <h4 className="font-medium">{kb.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {kb.enabled ? "Active" : "Disabled"} knowledge source
                    </p>
                  </div>
                  <Switch
                    checked={kb.enabled}
                    onCheckedChange={(checked) => {
                      setKnowledgeBases(knowledgeBases.map((k) => (k.id === kb.id ? { ...k, enabled: checked } : k)))
                    }}
                  />
                </div>
              ))}

              <Button className="gap-2 mt-6">
                <Save className="h-4 w-4" />
                Save Knowledge Base Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
