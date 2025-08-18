import { MetricCard } from "@/components/metric-card"
import { ActivityFeed } from "@/components/activity-feed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, CheckCircle, Clock, Zap } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your CoreComm AI customer support platform</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Calls" value="2,847" change="+12.5%" trend="up" icon={Phone} />
        <MetricCard title="Resolved Calls" value="2,634" change="+8.2%" trend="up" icon={CheckCircle} />
        <MetricCard title="Avg Call Duration" value="4m 32s" change="-2.1%" trend="down" icon={Clock} />
        <MetricCard title="MCP Actions" value="1,429" change="+18.7%" trend="up" icon={Zap} />
      </div>

      {/* Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Real-time feed of customer support interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Calls</span>
                <span className="font-semibold text-primary">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Queue Length</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Wait Time</span>
                <span className="font-semibold">1m 23s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-semibold text-green-600">94.2%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Voice AI</span>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">MCP Servers</span>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Analytics</span>
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
