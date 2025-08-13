"use client"

import { useState } from "react"
import { CallLogsTable } from "@/components/call-logs-table"
import { CallTranscriptModal } from "@/components/call-transcript-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download } from "lucide-react"

export default function CallLogsPage() {
  const [selectedCall, setSelectedCall] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Call Logs</h2>
        <p className="text-muted-foreground">View and manage all customer support calls</p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find specific calls using filters and search</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by caller name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>Complete log of all customer support interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <CallLogsTable searchQuery={searchQuery} statusFilter={statusFilter} onViewTranscript={setSelectedCall} />
        </CardContent>
      </Card>

      <CallTranscriptModal
        call={selectedCall}
        open={!!selectedCall}
        onOpenChange={(open) => !open && setSelectedCall(null)}
      />
    </div>
  )
}
