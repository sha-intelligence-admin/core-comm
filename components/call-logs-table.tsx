"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CallTranscriptModal } from "./call-transcript-modal"
import { Eye, Download, ChevronDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Call } from "@/hooks/use-call-logs"
import { LoadingSpinner } from "./loading-spinner"

interface CallLogsTableProps {
  data?: Call[]
  loading?: boolean
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-500/20 text-green-500"
    case "in-progress":
      return "bg-blue-500/20 text-blue-500"
    case "escalated":
      return "bg-purple-500/20 text-purple-500"
    default:
      return "bg-gray-500/20 text-gray-500"
  }
}

const formatStatus = (status: string) => status.charAt(0).toUpperCase() + status.slice(1)

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export function CallLogsTable({ data, loading = false }: CallLogsTableProps) {
  // Transform real data from database
  const callLogs = data ? data.map(call => ({
    id: call.id,
    callerName: call.caller_number, // Use caller_number as name since we don't have a name field
    callerNumber: call.caller_number,
    date: new Date(call.created_at),
    duration: formatDuration(call.duration),
    status: call.resolution_status,
    summary: call.summary || 'No summary available',
    transcript: call.transcript || 'No transcript available',
  })) : []

  const [selectedCall, setSelectedCall] = useState<(typeof callLogs)[0] | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (callLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="google-title-large text-foreground mb-2">No call logs found</h3>
        <p className="google-body-medium text-muted-foreground max-w-sm">
          There are no calls matching your current filters. Try adjusting your search criteria or date range.
        </p>
      </div>
    )
  }

  const toggleCardExpansion = (id: string) => {
    setExpandedCard((current) => (current === id ? null : id))
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-3">
          {callLogs.map((call) => {
            const isExpanded = expandedCard === call.id
            const expandedBodyId = `call-card-details-${call.id}`

            return (
              <div key={call.id} className="rounded-sm border border-input bg-card p-4 shadow-sm transition-all duration-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="google-title-medium text-foreground">{call.callerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(call.date, { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(call.status)} transition-all duration-200`}
                    >
                      {formatStatus(call.status)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full border transition-colors duration-200 ${isExpanded ? "border-primary bg-primary/5 text-primary" : "border-transparent"
                        }`}
                      onClick={() => toggleCardExpansion(call.id)}
                      aria-expanded={isExpanded}
                      aria-controls={expandedBodyId}
                      aria-label={`${isExpanded ? "Hide" : "Show"} call actions`}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                          }`}
                      />
                    </Button>
                  </div>
                </div>

                <div
                  id={expandedBodyId}
                  className={`grid transition-[grid-template-rows,opacity,margin,visibility] duration-300 ease-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
                    }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="space-y-4 border-t border-input pt-4 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-foreground">Phone</span>
                        <span className="text-right">{call.callerNumber}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-foreground">Duration</span>
                        <span className="text-right text-foreground">{call.duration}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Summary</span>
                        <p className="mt-1 leading-5 text-muted-foreground">{call.summary}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCall(call)}
                          className="rounded-sm border-input hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View transcript
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-sm border-input bg-transparent hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export call
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="hidden rounded-sm border border-input bg-card">
          <div className="w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-primary/5 transition-colors duration-200">
                  <TableHead>Caller</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callLogs.map((call) => (
                  <TableRow
                    key={call.id}
                    className="hover:bg-primary/5 transition-all duration-300 hover:shadow-sm cursor-pointer group"
                  >
                    <TableCell className="font-medium group-hover:text-primary transition-colors duration-200">
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
                        {formatStatus(call.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCall(call)}
                          className="rounded-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-sm bg-transparent hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
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
        </div>
      </div>

      <CallTranscriptModal
        call={selectedCall}
        open={!!selectedCall}
        onOpenChange={(open) => !open && setSelectedCall(null)}
      />
    </>
  )
}
