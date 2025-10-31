"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CallTranscriptModal } from "./call-transcript-modal"
import { Eye, Download, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useCalls, type Call } from "@/hooks/use-calls"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CallLogsTableProps {
  filters?: {
    resolution_status?: string
    call_type?: string
    search?: string
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "escalated":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "failed":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "N/A"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

export function CallLogsTable({ filters }: CallLogsTableProps) {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const { calls, isLoading, error } = useCalls({ limit: 50, ...filters })

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load call logs: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <span className="ml-2 text-muted-foreground">Loading call logs...</span>
      </div>
    )
  }

  if (!calls || calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No calls found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Call logs will appear here once your voice agents start handling calls
        </p>
      </div>
    )
  }

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
            {calls.map((call) => (
              <TableRow
                key={call.id}
                className="hover:bg-brand/5 transition-all duration-300 hover:shadow-sm cursor-pointer group"
              >
                <TableCell className="font-medium group-hover:text-brand transition-colors duration-200">
                  {call.caller_number}
                </TableCell>
                <TableCell className="group-hover:text-foreground transition-colors duration-200">
                  {call.caller_number}
                </TableCell>
                <TableCell className="group-hover:text-foreground transition-colors duration-200">
                  {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="group-hover:text-foreground transition-colors duration-200">
                  {formatDuration(call.duration)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(call.resolution_status)} transition-all duration-200 group-hover:scale-105`}
                  >
                    {call.resolution_status}
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
                    {call.recording_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(call.recording_url || '', '_blank')}
                        className="rounded-lg bg-transparent hover:bg-brand hover:text-white hover:border-brand transition-all duration-200 hover:scale-105"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Recording
                      </Button>
                    )}
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
