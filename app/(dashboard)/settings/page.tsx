import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl">
          <TabsTrigger value="profile" className="rounded-xl">
            Profile
          </TabsTrigger>
          <TabsTrigger value="voice" className="rounded-xl">
            Voice
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="rounded-xl">
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl">
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-40x40.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="rounded-xl bg-transparent">
                    Change Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" className="rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@company.com" className="rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" defaultValue="Acme Corp" className="rounded-xl" />
              </div>

              <Button className="rounded-xl">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Configure text-to-speech and voice recognition settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="voice">Voice Model</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
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
                <Label htmlFor="speed">Speech Speed</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
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
                <Label htmlFor="language">Language</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
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

              <Button className="rounded-xl">Test Voice</Button>
              <Button className="rounded-xl ml-2">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Knowledge Base Sources</CardTitle>
              <CardDescription>Enable or disable retrieval from specific knowledge sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="kb-docs">Company Documentation</Label>
                    <p className="text-sm text-muted-foreground">Internal company policies and procedures</p>
                  </div>
                  <Switch id="kb-docs" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="kb-faq">FAQ Database</Label>
                    <p className="text-sm text-muted-foreground">Frequently asked questions and answers</p>
                  </div>
                  <Switch id="kb-faq" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="kb-products">Product Information</Label>
                    <p className="text-sm text-muted-foreground">Product specifications and features</p>
                  </div>
                  <Switch id="kb-products" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="kb-external">External Resources</Label>
                    <p className="text-sm text-muted-foreground">Third-party documentation and resources</p>
                  </div>
                  <Switch id="kb-external" />
                </div>
              </div>

              <Button className="rounded-xl">Update Knowledge Sources</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email alerts for important events</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="call-alerts">Call Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when calls require attention</p>
                  </div>
                  <Switch id="call-alerts" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-updates">System Updates</Label>
                    <p className="text-sm text-muted-foreground">Notifications about system maintenance and updates</p>
                  </div>
                  <Switch id="system-updates" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="integration-alerts">Integration Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alerts when integrations go offline or fail</p>
                  </div>
                  <Switch id="integration-alerts" defaultChecked />
                </div>
              </div>

              <Button className="rounded-xl">Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
