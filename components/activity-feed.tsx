"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"
import { Phone } from "lucide-react"

interface Call {
  id: string
  caller_number: string
  recipient_number: string | null
  duration: number
  resolution_status: string
  summary: string | null
  created_at: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-500/20 text-green-500"
    case "pending":
      return "bg-blue-500/20 text-blue-500"
    case "escalated":
      return "bg-purple-500/20 text-purple-500"
    case "failed":
      return "bg-red-500/20 text-red-500"
    default:
      return "bg-gray-500/20 text-gray-500"
  }
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s`
}

export function ActivityFeed() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await fetch("/api/dashboard/activity?limit=5")
        if (response.ok) {
          const data = await response.json()
          setCalls(data.calls)
        }
      } catch (error) {
        console.error("Failed to fetch activity:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 rounded-sm border border-input animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Phone className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="google-title-large mb-2">No calls yet</h3>
        <p className="text-muted-foreground google-body-medium mb-4">
          Your recent call activity will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {calls.map((call) => (
        <div
          key={call.id}
          className="flex items-center space-x-4 p-4 rounded-sm border border-input hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer group/call"
        >
          <Avatar className="group-hover/call:scale-110 transition-transform duration-200">
            <AvatarFallback className="group-hover/call:bg-brand/10 transition-colors duration-200">
              <Phone className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="google-title-medium group-hover/call:text-brand transition-colors duration-200">
                {call.caller_number}
              </p>
              <Badge
                variant="secondary"
                className={`${getStatusColor(call.resolution_status)} transition-colors google-body-small duration-200`}
              >
                {call.resolution_status}
              </Badge>
            </div>
            <p className="google-body-small text-muted-foreground group-hover/call:text-foreground transition-colors duration-200">
              {call.summary || "No summary available"}
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground group-hover/call:text-muted-foreground/80 transition-colors duration-200">
              <span>{call.caller_number}</span>
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
