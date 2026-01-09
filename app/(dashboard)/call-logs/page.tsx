"use client"

import { CallLogsTable } from "@/components/call-logs-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download } from "lucide-react"
import { useCallLogs } from "@/hooks/use-call-logs"
import { useState } from "react"

export default function CallLogsPage() {
  const { calls, loading, fetchCalls, pagination } = useCallLogs()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    fetchCalls({ 
      search: value || undefined,
      resolution_status: statusFilter !== "all" ? statusFilter as any : undefined,
      page: 1 
    })
  }
  
  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    fetchCalls({ 
      search: searchTerm || undefined,
      resolution_status: value !== "all" ? value as any : undefined,
      page: 1 
    })
  }
  
  return (
    <div className="space-y-6 overflow-x-hidden">
      <div>
        <h1 className="google-headline-medium">Call Logs</h1>
        <p className="google-body-medium text-muted-foreground">
          View and analyze all communications interactions
        </p>
      </div>

      <Card className="rounded-sm transition-all duration-300 hover:border-primary/50 border-input group">
        <CardHeader className="transition-colors duration-300 rounded-t-sm">
          <div className="google-headline-small transition-colors duration-200">Search &amp; Filter</div>
          <div className="google-body-medium text-muted-foreground">
            Find specific calls or filter by criteria
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              <Input
                placeholder="Search by caller name, number, or transcript..."
                className="pl-10 h-11 rounded-sm border-input focus:border-primary focus:ring-primary/20 hover:border-primary/60 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:ml-auto lg:justify-end">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-44 rounded-sm border-input hover:border-primary/60 focus:border-primary transition-all duration-200">
                  <SelectValue placeholder="Resolution Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                    All Status
                  </SelectItem>
                  <SelectItem
                    value="resolved"
                    className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                  >
                    Resolved
                  </SelectItem>
                  <SelectItem
                    value="pending"
                    className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                  >
                    Pending
                  </SelectItem>
                  <SelectItem
                    value="escalated"
                    className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                  >
                    Escalated
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-40 rounded-sm border-input hover:border-primary/60 focus:border-primary transition-all duration-200">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                  >
                    All Time
                  </SelectItem>
                  <SelectItem
                    value="today"
                    className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                  >
                    Today
                  </SelectItem>
                  <SelectItem
                    value="week"
                    className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                  >
                    This Week
                  </SelectItem>
                  <SelectItem
                    value="month"
                    className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                  >
                    This Month
                  </SelectItem>
                  <SelectItem
                    value="custom"
                    className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                  >
                    Custom Range
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 sm:w-auto">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-sm bg-transparent border-input hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-sm bg-transparent border-input hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm hover:shadow-lg transition-all duration-300 hover:border-primary/50 border-input group">
        <CardHeader className="transition-colors duration-300 rounded-t-sm">
          <div className="google-headline-small transition-colors duration-200">Call History</div>
          <div className="google-body-medium text-muted-foreground">
            Complete log of all customer interactions
          </div>
        </CardHeader>
        <CardContent>
          <CallLogsTable data={calls} loading={loading} />
        </CardContent>
      </Card>
      
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} calls
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCalls({ page: pagination.page - 1 })}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCalls({ page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
