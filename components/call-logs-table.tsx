"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CallTranscriptModal } from "./call-transcript-modal"
import { Eye, Download } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const callLogs = [
  {
    id: "1",
    callerName: "Sarah Johnson",
    callerNumber: "+1 (555) 123-4567",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    duration: "3m 45s",
    status: "resolved",
    transcript:
      "Customer called regarding a product return. AI successfully guided them through the return process and provided a return label.",
  },
  {
    id: "2",
    callerName: "Mike Chen",
    callerNumber: "+1 (555) 987-6543",
    date: new Date(Date.now() - 1000 * 60 * 60 * 4),
    duration: "5m 12s",
    status: "escalated",
    transcript:
      "Technical support request for software installation. Issue was complex and required human intervention.",
  },
  {
    id: "3",
    callerName: "Emily Davis",
    callerNumber: "+1 (555) 456-7890",
    date: new Date(Date.now() - 1000 * 60 * 60 * 6),
    duration: "2m 15s",
    status: "resolved",
    transcript: "Billing inquiry about recent charges. AI explained the charges and provided account details.",
  },
  {
    id: "4",
    callerName: "Robert Wilson",
    callerNumber: "+1 (555) 321-0987",
    date: new Date(Date.now() - 1000 * 60 * 60 * 8),
    duration: "4m 33s",
    status: "pending",
    transcript: "Product configuration question. AI provided initial guidance but follow-up required.",
  },
  {
    id: "5",
    callerName: "Lisa Anderson",
    callerNumber: "+1 (555) 654-3210",
    date: new Date(Date.now() - 1000 * 60 * 60 * 12),
    duration: "1m 58s",
    status: "resolved",
    transcript: "Order status inquiry. AI provided tracking information and delivery estimate.",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "escalated":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

export function CallLogsTable() {
  const [selectedCall, setSelectedCall] = useState<(typeof callLogs)[0] | null>(null)

  return (
    <>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-brand/5 transition-colors duration-200">
              <TableHead>Caller</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {callLogs.map((call) => (
              <TableRow
                key={call.id}
                className="hover:bg-brand/5 transition-all duration-300 hover:shadow-sm cursor-pointer group"
              >
                <TableCell className="font-medium group-hover:text-brand transition-colors duration-200">
                  {call.callerName}
                </TableCell>
                <TableCell className="group-hover:text-foreground transition-colors duration-200">
                  {call.callerNumber}
                </TableCell>
                <TableCell className="group-hover:text-foreground transition-colors duration-200">
                  {formatDistanceToNow(call.date, { addSuffix: true })}
                </TableCell>
                <TableCell className="group-hover:text-foreground transition-colors duration-200">
                  {call.duration}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(call.status)} transition-all duration-200 group-hover:scale-105`}
                  >
                    {call.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCall(call)}
                      className="rounded-lg hover:bg-brand hover:text-white hover:border-brand transition-all duration-200 hover:scale-105"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg bg-transparent hover:bg-brand hover:text-white hover:border-brand transition-all duration-200 hover:scale-105"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CallTranscriptModal
        call={selectedCall}
        open={!!selectedCall}
        onOpenChange={(open) => !open && setSelectedCall(null)}
      />
    </>
  )
}
