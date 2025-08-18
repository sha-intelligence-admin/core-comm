import { CallLogsTable } from "@/components/call-logs-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download } from "lucide-react"

export default function CallLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Call Logs</h1>
        <p className="text-muted-foreground">View and analyze all customer support interactions</p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find specific calls or filter by criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by caller name, number, or transcript..." className="pl-10 rounded-xl" />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Resolution Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="rounded-xl bg-transparent">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl bg-transparent">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>Complete log of all customer interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <CallLogsTable />
        </CardContent>
      </Card>
    </div>
  )
}
