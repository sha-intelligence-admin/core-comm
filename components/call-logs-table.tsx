"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download } from "lucide-react"

const mockCalls = [
  {
    id: "1",
    callerName: "Sarah Johnson",
    callerNumber: "+1 (555) 123-4567",
    date: "2024-01-15",
    time: "14:30",
    duration: "4m 32s",
    status: "resolved",
    transcript: "Customer called about billing inquiry...",
  },
  {
    id: "2",
    callerName: "Mike Chen",
    callerNumber: "+1 (555) 987-6543",
    date: "2024-01-15",
    time: "13:45",
    duration: "2m 18s",
    status: "resolved",
    transcript: "Password reset request...",
  },
  {
    id: "3",
    callerName: "Emily Davis",
    callerNumber: "+1 (555) 456-7890",
    date: "2024-01-15",
    time: "12:20",
    duration: "6m 45s",
    status: "escalated",
    transcript: "Technical issue requiring human support...",
  },
  {
    id: "4",
    callerName: "Robert Wilson",
    callerNumber: "+1 (555) 321-0987",
    date: "2024-01-14",
    time: "16:15",
    duration: "3m 21s",
    status: "resolved",
    transcript: "Product information request...",
  },
  {
    id: "5",
    callerName: "Lisa Anderson",
    callerNumber: "+1 (555) 654-3210",
    date: "2024-01-14",
    time: "15:30",
    duration: "5m 12s",
    status: "pending",
    transcript: "Follow-up required for account issue...",
  },
]

interface CallLogsTableProps {
  searchQuery: string
  statusFilter: string
  onViewTranscript: (call: any) => void
}

export function CallLogsTable({ searchQuery, statusFilter, onViewTranscript }: CallLogsTableProps) {
  const filteredCalls = mockCalls.filter((call) => {
    const matchesSearch =
      call.callerName.toLowerCase().includes(searchQuery.toLowerCase()) || call.callerNumber.includes(searchQuery)
    const matchesStatus = statusFilter === "all" || call.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "escalated":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Caller</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCalls.map((call) => (
            <TableRow key={call.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{call.callerName}</div>
                  <div className="text-sm text-muted-foreground">{call.callerNumber}</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{call.date}</div>
                  <div className="text-sm text-muted-foreground">{call.time}</div>
                </div>
              </TableCell>
              <TableCell>{call.duration}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(call.status)}>
                  {call.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onViewTranscript(call)} className="gap-1">
                    <Eye className="h-4 w-4" />
                    Transcript
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
