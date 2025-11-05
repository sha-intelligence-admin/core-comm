import { MetricCard } from "@/components/metric-card"
import { ActivityFeed } from "@/components/activity-feed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, CheckCircle, Clock, Zap } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="google-headline-medium">Dashboard</h1>
        <p className="text-muted-foreground google-body-medium">Welcome to your CoreComm AI customer support platform</p>
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
          <Card className="rounded-sm transition-all duration-300 hover:border-primary/50 border-input group">
            <CardHeader className=" transition-colors duration-300 rounded-t-sm">
              <div className="transition-colors duration-200 google-headline-small">Recent Activity</div>
              <div className="google-body-medium text-muted-foreground">Real-time feed of customer support interactions</div>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-sm transition-all duration-300 border-input hover:border-primary/50 group cursor-pointer">
            <CardHeader className=" transition-colors duration-300 rounded-t-sm">
              <div className="google-headline-small transition-colors duration-200">Quick Stats</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-lg transition-colors duration-200">
                <span className="google-title-small text-muted-foreground">Active Calls</span>
                <span className="font-semibold text-primary group-hover:text-brand transition-colors duration-200">
                  12
                </span>
              </div>
              <div className="flex items-center justify-between  p-2 rounded-lg transition-colors duration-200">
                <span className="google-title-small text-muted-foreground">Queue Length</span>
                <span className="font-semibold group-hover:text-brand transition-colors duration-200">3</span>
              </div>
              <div className="flex items-center justify-between  p-2 rounded-lg transition-colors duration-200">
                <span className="google-title-small text-muted-foreground">Avg Wait Time</span>
                <span className="font-semibold group-hover:text-brand transition-colors duration-200">1m 23s</span>
              </div>
              <div className="flex items-center justify-between  p-2 rounded-lg transition-colors duration-200">
                <span className="google-title-small text-muted-foreground">Success Rate</span>
                <span className="font-semibold text-green-600 group-hover:text-green-700 transition-colors duration-200">
                  94.2%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm transition-all duration-300 border-input hover:border-primary/50 group cursor-pointer">
            <CardHeader className=" transition-colors duration-300 rounded-t-sm">
              <div className="google-headline-small transition-colors duration-200">System Status</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between  p-2 rounded-lg transition-colors duration-200">
                <span className="google-title-small text-muted-foreground">Voice AI</span>
                <div className="h-2 w-2 rounded-full bg-green-500 group-hover:scale-125 transition-transform duration-200"></div>
              </div>
              <div className="flex items-center justify-between  p-2 rounded-lg transition-colors duration-200">
                <span className="google-title-small text-muted-foreground">MCP Servers</span>
                <div className="h-2 w-2 rounded-full bg-green-500 group-hover:scale-125 transition-transform duration-200"></div>
              </div>
              <div className="flex items-center justify-between  p-2 rounded-lg transition-colors duration-200">
                <span className="google-title-small text-muted-foreground">Database</span>
                <div className="h-2 w-2 rounded-full bg-green-500 group-hover:scale-125 transition-transform duration-200"></div>
              </div>
              <div className="flex items-center justify-between  p-2 rounded-lg transition-colors duration-200">
                <span className="google-title-small text-muted-foreground">Analytics</span>
                <div className="h-2 w-2 rounded-full bg-yellow-500 group-hover:scale-125 transition-transform duration-200"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
