"use client"

import { MetricCard } from "@/components/metric-card"
import { ActivityFeed } from "@/components/activity-feed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, CheckCircle, Clock, Zap, Loader2 } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"

export default function DashboardPage() {
  const { stats, isLoading } = useDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your CoreComm AI customer support platform</p>
      </div>

      {/* Metrics Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Calls"
            value={stats.totalCalls.toString()}
            change={stats.totalCallsChange}
            trend={stats.totalCallsTrend as "up" | "down"}
            icon={Phone}
          />
          <MetricCard
            title="Resolved Calls"
            value={stats.resolvedCalls.toString()}
            change={stats.resolvedCallsChange}
            trend={stats.resolvedCallsTrend as "up" | "down"}
            icon={CheckCircle}
          />
          <MetricCard
            title="Avg Call Duration"
            value={stats.avgDuration}
            change={stats.avgDurationChange}
            trend={stats.avgDurationTrend as "up" | "down"}
            icon={Clock}
          />
          <MetricCard
            title="Active Calls"
            value={stats.activeCalls.toString()}
            change={stats.activeCallsChange}
            trend={stats.activeCallsTrend}
            icon={Zap}
          />
        </div>
      )}

      {/* Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-brand/50 group">
            <CardHeader className="group-hover:bg-brand/5 transition-colors duration-300 rounded-t-2xl">
              <CardTitle className="group-hover:text-brand transition-colors duration-200">Recent Activity</CardTitle>
              <CardDescription>Real-time feed of customer support interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-brand/50 hover:scale-105 group cursor-pointer">
            <CardHeader className="group-hover:bg-brand/5 transition-colors duration-300 rounded-t-2xl">
              <CardTitle className="group-hover:text-brand transition-colors duration-200">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between group-hover:bg-brand/5 p-2 rounded-lg transition-colors duration-200">
                <span className="text-sm text-muted-foreground">Active Calls</span>
                <span className="font-semibold text-primary group-hover:text-brand transition-colors duration-200">
                  {stats.activeCalls}
                </span>
              </div>
              <div className="flex items-center justify-between group-hover:bg-brand/5 p-2 rounded-lg transition-colors duration-200">
                <span className="text-sm text-muted-foreground">Queue Length</span>
                <span className="font-semibold group-hover:text-brand transition-colors duration-200">
                  {stats.queueLength}
                </span>
              </div>
              <div className="flex items-center justify-between group-hover:bg-brand/5 p-2 rounded-lg transition-colors duration-200">
                <span className="text-sm text-muted-foreground">Avg Wait Time</span>
                <span className="font-semibold group-hover:text-brand transition-colors duration-200">
                  {stats.avgWaitTime}
                </span>
              </div>
              <div className="flex items-center justify-between group-hover:bg-brand/5 p-2 rounded-lg transition-colors duration-200">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-semibold text-green-600 group-hover:text-green-700 transition-colors duration-200">
                  {stats.successRate}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-brand/50 hover:scale-105 group cursor-pointer">
            <CardHeader className="group-hover:bg-brand/5 transition-colors duration-300 rounded-t-2xl">
              <CardTitle className="group-hover:text-brand transition-colors duration-200">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between group-hover:bg-brand/5 p-2 rounded-lg transition-colors duration-200">
                <span className="text-sm">Voice AI</span>
                <div className="h-2 w-2 rounded-full bg-green-500 group-hover:scale-125 transition-transform duration-200"></div>
              </div>
              <div className="flex items-center justify-between group-hover:bg-brand/5 p-2 rounded-lg transition-colors duration-200">
                <span className="text-sm">MCP Servers</span>
                <div className="h-2 w-2 rounded-full bg-green-500 group-hover:scale-125 transition-transform duration-200"></div>
              </div>
              <div className="flex items-center justify-between group-hover:bg-brand/5 p-2 rounded-lg transition-colors duration-200">
                <span className="text-sm">Database</span>
                <div className="h-2 w-2 rounded-full bg-green-500 group-hover:scale-125 transition-transform duration-200"></div>
              </div>
              <div className="flex items-center justify-between group-hover:bg-brand/5 p-2 rounded-lg transition-colors duration-200">
                <span className="text-sm">Analytics</span>
                <div className="h-2 w-2 rounded-full bg-yellow-500 group-hover:scale-125 transition-transform duration-200"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
