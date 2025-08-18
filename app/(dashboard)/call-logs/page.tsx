import { CallLogsTable } from "@/components/call-logs-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download } from "lucide-react"

export default function CallLogsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand/10 to-transparent p-6 rounded-2xl border border-brand/20">
        <h1 className="text-3xl font-bold tracking-tight text-brand">Call Logs</h1>
        <p className="text-muted-foreground">View and analyze all customer support interactions</p>
      </div>

      <Card className="rounded-2xl border-brand/20 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group">
        <CardHeader className="bg-gradient-to-r from-brand/5 to-transparent group-hover:from-brand/10 transition-all duration-300 rounded-t-2xl">
          <CardTitle className="text-brand group-hover:text-brand/80 transition-colors duration-200">
            Search & Filter
          </CardTitle>
          <CardDescription>Find specific calls or filter by criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-brand transition-colors duration-200" />
              <Input
                placeholder="Search by caller name, number, or transcript..."
                className="pl-10 rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20 hover:border-brand/40 transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[180px] rounded-xl border-brand/20 hover:border-brand/40 focus:border-brand transition-all duration-200">
                  <SelectValue placeholder="Resolution Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="hover:bg-brand/10 hover:text-brand transition-colors duration-200">
                    All Status
                  </SelectItem>
                  <SelectItem
                    value="resolved"
                    className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                  >
                    Resolved
                  </SelectItem>
                  <SelectItem
                    value="pending"
                    className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                  >
                    Pending
                  </SelectItem>
                  <SelectItem
                    value="escalated"
                    className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                  >
                    Escalated
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[140px] rounded-xl border-brand/20 hover:border-brand/40 focus:border-brand transition-all duration-200">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="today"
                    className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                  >
                    Today
                  </SelectItem>
                  <SelectItem
                    value="week"
                    className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                  >
                    This Week
                  </SelectItem>
                  <SelectItem
                    value="month"
                    className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                  >
                    This Month
                  </SelectItem>
                  <SelectItem
                    value="custom"
                    className="hover:bg-brand/10 hover:text-brand transition-colors duration-200"
                  >
                    Custom Range
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl bg-brand/5 border-brand/30 hover:bg-brand hover:text-white hover:scale-110 transition-all duration-200"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl bg-brand/5 border-brand/30 hover:bg-brand hover:text-white hover:scale-110 transition-all duration-200"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-brand/20 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group">
        <CardHeader className="bg-gradient-to-r from-brand/5 to-transparent group-hover:from-brand/10 transition-all duration-300 rounded-t-2xl">
          <CardTitle className="text-brand group-hover:text-brand/80 transition-colors duration-200">
            Call History
          </CardTitle>
          <CardDescription>Complete log of all customer interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <CallLogsTable />
        </CardContent>
      </Card>
    </div>
  )
}
