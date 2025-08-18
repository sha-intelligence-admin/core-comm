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
      <div className="bg-gradient-to-r from-brand/10 to-transparent p-6 rounded-2xl border border-brand/20">
        <h1 className="text-3xl font-bold tracking-tight text-brand">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

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
                  <AvatarImage src="/placeholder-40x40.png" />
                  <AvatarFallback className="bg-brand/10 text-brand text-xl">JD</AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    variant="outline"
                    className="rounded-xl bg-brand/5 border-brand/30 hover:bg-brand hover:text-white hover:scale-105 transition-all duration-200"
                  >
                    Change Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <Separator className="bg-brand/20" />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-brand/80 font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    defaultValue="John"
                    className="rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20 hover:border-brand/40 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-brand/80 font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    defaultValue="Doe"
                    className="rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20 hover:border-brand/40 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand/80 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john@company.com"
                  className="rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20 hover:border-brand/40 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-brand/80 font-medium">
                  Company
                </Label>
                <Input
                  id="company"
                  defaultValue="Acme Corp"
                  className="rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20 hover:border-brand/40 transition-all duration-200"
                />
              </div>

              <Button className="rounded-xl bg-brand hover:bg-brand/90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <Card className="rounded-2xl border-brand/20 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-r from-brand/5 to-transparent group-hover:from-brand/10 transition-all duration-300 rounded-t-2xl">
              <CardTitle className="text-brand group-hover:text-brand/80 transition-colors duration-200">
                Voice Settings
              </CardTitle>
              <CardDescription>Configure text-to-speech and voice recognition settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="voice" className="text-brand/80 font-medium">
                  Voice Model
                </Label>
                <Select>
                  <SelectTrigger className="rounded-xl border-brand/20 hover:border-brand/40 focus:border-brand transition-all duration-200">
                    <SelectValue placeholder="Select voice model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="neural-1"
                      className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                    >
                      Neural Voice 1 (Female)
                    </SelectItem>
                    <SelectItem
                      value="neural-2"
                      className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                    >
                      Neural Voice 2 (Male)
                    </SelectItem>
                    <SelectItem
                      value="standard-1"
                      className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                    >
                      Standard Voice 1
                    </SelectItem>
                    <SelectItem
                      value="standard-2"
                      className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                    >
                      Standard Voice 2
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speed" className="text-brand/80 font-medium">
                  Speech Speed
                </Label>
                <Select>
                  <SelectTrigger className="rounded-xl border-brand/20 hover:border-brand/40 focus:border-brand transition-all duration-200">
                    <SelectValue placeholder="Select speech speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="slow"
                      className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                    >
                      Slow (0.8x)
                    </SelectItem>
                    <SelectItem
                      value="normal"
                      className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                    >
                      Normal (1.0x)
                    </SelectItem>
                    <SelectItem
                      value="fast"
                      className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                    >
                      Fast (1.2x)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-brand/80 font-medium">
                  Language
                </Label>
                <Select>
                  <SelectTrigger className="rounded-xl border-brand/20 hover:border-brand/40 focus:border-brand transition-all duration-200">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="en-US"
                      className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                    >
                      English (US)
                    </SelectItem>
                    <SelectItem
                      value="en-GB"
                      className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                    >
                      English (UK)
                    </SelectItem>
                    <SelectItem
                      value="es-ES"
                      className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                    >
                      Spanish
                    </SelectItem>
                    <SelectItem
                      value="fr-FR"
                      className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                    >
                      French
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-brand/30 hover:bg-brand/10 hover:text-brand hover:border-brand transition-all duration-200 bg-transparent"
                >
                  Test Voice
                </Button>
                <Button className="rounded-xl bg-brand hover:bg-brand/90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <Card className="rounded-2xl border-brand/20 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-r from-brand/5 to-transparent group-hover:from-brand/10 transition-all duration-300 rounded-t-2xl">
              <CardTitle className="text-brand group-hover:text-brand/80 transition-colors duration-200">
                Knowledge Base Sources
              </CardTitle>
              <CardDescription>Enable or disable retrieval from specific knowledge sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-brand/20 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300 group">
                  <div>
                    <Label
                      htmlFor="kb-docs"
                      className="font-medium group-hover:text-brand transition-colors duration-200"
                    >
                      Company Documentation
                    </Label>
                    <p className="text-sm text-muted-foreground">Internal company policies and procedures</p>
                  </div>
                  <Switch id="kb-docs" defaultChecked className="data-[state=checked]:bg-brand" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-brand/20 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300 group">
                  <div>
                    <Label
                      htmlFor="kb-faq"
                      className="font-medium group-hover:text-brand transition-colors duration-200"
                    >
                      FAQ Database
                    </Label>
                    <p className="text-sm text-muted-foreground">Frequently asked questions and answers</p>
                  </div>
                  <Switch id="kb-faq" defaultChecked className="data-[state=checked]:bg-brand" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-brand/20 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300 group">
                  <div>
                    <Label
                      htmlFor="kb-products"
                      className="font-medium group-hover:text-brand transition-colors duration-200"
                    >
                      Product Information
                    </Label>
                    <p className="text-sm text-muted-foreground">Product specifications and features</p>
                  </div>
                  <Switch id="kb-products" defaultChecked className="data-[state=checked]:bg-brand" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-brand/20 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300 group">
                  <div>
                    <Label
                      htmlFor="kb-external"
                      className="font-medium group-hover:text-brand transition-colors duration-200"
                    >
                      External Resources
                    </Label>
                    <p className="text-sm text-muted-foreground">Third-party documentation and resources</p>
                  </div>
                  <Switch id="kb-external" className="data-[state=checked]:bg-brand" />
                </div>
              </div>

              <Button className="rounded-xl bg-brand hover:bg-brand/90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                Update Knowledge Sources
              </Button>
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
