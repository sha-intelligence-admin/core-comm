import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

const activities = [
  {
    id: "1",
    caller: "Sarah Johnson",
    phone: "+1 (555) 123-4567",
    status: "resolved",
    duration: "3m 45s",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    issue: "Product return inquiry",
  },
  {
    id: "2",
    caller: "Mike Chen",
    phone: "+1 (555) 987-6543",
    status: "in-progress",
    duration: "1m 23s",
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    issue: "Technical support request",
  },
  {
    id: "3",
    caller: "Emily Davis",
    phone: "+1 (555) 456-7890",
    status: "resolved",
    duration: "2m 15s",
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    issue: "Billing question",
  },
  {
    id: "4",
    caller: "Robert Wilson",
    phone: "+1 (555) 321-0987",
    status: "escalated",
    duration: "5m 32s",
    timestamp: new Date(Date.now() - 1000 * 60 * 18),
    issue: "Complex product configuration",
  },
  {
    id: "5",
    caller: "Lisa Anderson",
    phone: "+1 (555) 654-3210",
    status: "resolved",
    duration: "1m 58s",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    issue: "Order status inquiry",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-100 text-green-800"
    case "in-progress":
      return "bg-blue-100 text-blue-800"
    case "escalated":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function ActivityFeed() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-xl border">
          <Avatar>
            <AvatarImage src={`/placeholder-40x40.png`} />
            <AvatarFallback>
              {activity.caller
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{activity.caller}</p>
              <Badge variant="secondary" className={getStatusColor(activity.status)}>
                {activity.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{activity.issue}</p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>{activity.phone}</span>
              <span>•</span>
              <span>{activity.duration}</span>
              <span>•</span>
              <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
