"use client"

import { MetricCard } from "@/components/metric-card"
import { ActivityFeed } from "@/components/activity-feed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, CheckCircle, Clock, Zap } from "lucide-react"
import { useEffect, useState } from "react"

interface DashboardMetrics {
  totalCalls: number
  resolvedCalls: number
  avgDuration: string
  avgDurationSeconds: number
  mcpActions: number
  activeCalls: number
  activeAgents: number
  successRate: number
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/dashboard/metrics")
        if (response.ok) {
          const data = await response.json()
          setMetrics(data.metrics)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="google-headline-medium">Dashboard</h1>
        <p className="text-muted-foreground google-body-medium">Welcome to your CoreComm AI customer support platform</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Calls" 
          value={loading ? "..." : metrics?.totalCalls.toLocaleString() || "0"} 
          change="" 
          trend="up" 
          icon={Phone} 
        />
        <MetricCard 
          title="Resolved Calls" 
          value={loading ? "..." : metrics?.resolvedCalls.toLocaleString() || "0"} 
          change="" 
          trend="up" 
          icon={CheckCircle} 
        />
        <MetricCard 
          title="Avg Call Duration" 
          value={loading ? "..." : metrics?.avgDuration || "0m 0s"} 
          change="" 
          trend="up" 
          icon={Clock} 
        />
        <MetricCard 
          title="Active Agents" 
          value={loading ? "..." : metrics?.activeAgents.toString() || "0"} 
          change="" 
          trend="up" 
          icon={Zap} 
        />
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
                  {loading ? "..." : metrics?.activeCalls || 0}
                </span>
              </div>
              <div className="flex items-center justify-between  p-2 rounded-lg transition-colors duration-200">
                <span className="google-title-small text-muted-foreground">Active Agents</span>
                <span className="font-semibold group-hover:text-brand transition-colors duration-200">
                  {loading ? "..." : metrics?.activeAgents || 0}
                </span>
              </div>
              <div className="flex items-center justify-between  p-2 rounded-lg transition-colors duration-200">
                <span className="google-title-small text-muted-foreground">Avg Duration</span>
                <span className="font-semibold group-hover:text-brand transition-colors duration-200">
                  {loading ? "..." : metrics?.avgDuration || "0m 0s"}
                </span>
              </div>
              <div className="flex items-center justify-between  p-2 rounded-lg transition-colors duration-200">
                <span className="google-title-small text-muted-foreground">Success Rate</span>
                <span className="font-semibold text-green-600 group-hover:text-green-700 transition-colors duration-200">
                  {loading ? "..." : `${metrics?.successRate || 0}%`}
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
