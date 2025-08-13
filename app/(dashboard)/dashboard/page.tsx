import { MetricCard } from "@/components/metric-card"
import { ActivityFeed } from "@/components/activity-feed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, CheckCircle, Clock, Zap } from "lucide-react"

const metrics = [
  {
    title: "Total Calls",
    value: "2,847",
    change: "+12.5%",
    icon: Phone,
    description: "Total calls this month",
  },
  {
    title: "Resolved Calls",
    value: "2,456",
    change: "+8.2%",
    icon: CheckCircle,
    description: "Successfully resolved",
  },
  {
    title: "Avg Call Duration",
    value: "4m 32s",
    change: "-2.1%",
    icon: Clock,
    description: "Average call length",
  },
  {
    title: "MCP Actions",
    value: "1,234",
    change: "+15.3%",
    icon: Zap,
    description: "Actions triggered",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your AI customer support platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-2xl">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Real-time feed of ongoing and recent calls</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ActivityFeed />
          </CardContent>
        </Card>
        <Card className="col-span-3 rounded-2xl">
          <CardHeader>
            <CardTitle>Call Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86.3%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            <div className="mt-4 h-[80px] bg-muted/50 rounded-xl flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Chart placeholder</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
