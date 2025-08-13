"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneCall, Clock } from "lucide-react"

const activities = [
  {
    id: "1",
    caller: "Sarah Johnson",
    phone: "+1 (555) 123-4567",
    status: "ongoing",
    duration: "2m 34s",
    issue: "Account billing question",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    caller: "Mike Chen",
    phone: "+1 (555) 987-6543",
    status: "resolved",
    duration: "4m 12s",
    issue: "Password reset assistance",
    timestamp: "8 minutes ago",
  },
  {
    id: "3",
    caller: "Emily Davis",
    phone: "+1 (555) 456-7890",
    status: "escalated",
    duration: "6m 45s",
    issue: "Technical support needed",
    timestamp: "15 minutes ago",
  },
  {
    id: "4",
    caller: "Robert Wilson",
    phone: "+1 (555) 321-0987",
    status: "resolved",
    duration: "3m 21s",
    issue: "Product information request",
    timestamp: "23 minutes ago",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "ongoing":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "resolved":
      return "bg-green-100 text-green-800 border-green-200"
    case "escalated":
      return "bg-orange-100 text-orange-800 border-orange-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "ongoing":
      return <PhoneCall className="h-3 w-3" />
    case "resolved":
      return <Phone className="h-3 w-3" />
    case "escalated":
      return <Clock className="h-3 w-3" />
    default:
      return <Phone className="h-3 w-3" />
  }
}

export function ActivityFeed() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start space-x-4 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`/placeholder-40x40.png?height=40&width=40&text=${activity.caller
                .split(" ")
                .map((n) => n[0])
                .join("")}`}
            />
            <AvatarFallback>
              {activity.caller
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium leading-none">{activity.caller}</p>
                <p className="text-xs text-muted-foreground">{activity.phone}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={`text-xs ${getStatusColor(activity.status)}`}>
                  {getStatusIcon(activity.status)}
                  <span className="ml-1 capitalize">{activity.status}</span>
                </Badge>
                <span className="text-xs text-muted-foreground">{activity.duration}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{activity.issue}</p>
            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
