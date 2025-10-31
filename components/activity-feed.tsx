"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { useCalls } from "@/hooks/use-calls"
import { Loader2 } from "lucide-react"

const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "pending":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
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

function getInitials(phoneNumber: string): string {
  // Extract last 4 digits for avatar fallback
  const digits = phoneNumber.replace(/\D/g, '').slice(-4)
  return digits.slice(0, 2) || "??"
}

export function ActivityFeed() {
  const { calls, isLoading } = useCalls({ limit: 5 })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    )
  }

  if (!calls || calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No recent activity</p>
        <p className="text-xs text-muted-foreground mt-1">
          Recent calls will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {calls.map((call) => (
        <div
          key={call.id}
          className="flex items-center space-x-4 p-4 rounded-xl border hover:border-brand/50 hover:bg-brand/5 transition-all duration-300 hover:shadow-md cursor-pointer group"
        >
          <Avatar className="group-hover:scale-110 transition-transform duration-200">
            <AvatarImage src={`/placeholder-40x40.png`} />
            <AvatarFallback className="group-hover:bg-brand/10 transition-colors duration-200">
              {getInitials(call.caller_number)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium group-hover:text-brand transition-colors duration-200">
                {call.caller_number}
              </p>
              <Badge
                variant="secondary"
                className={`${getStatusColor(call.resolution_status)} transition-colors duration-200`}
              >
                {call.resolution_status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200 line-clamp-1">
              {call.summary || call.transcript || "No summary available"}
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200">
              <span>{call.call_type}</span>
              <span>•</span>
              <span>{formatDuration(call.duration)}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
