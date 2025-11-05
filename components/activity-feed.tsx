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
      return "bg-green-500/20 text-green-500"
    case "in-progress":
      return "bg-blue-500/20 text-blue-500"
    case "escalated":
      return "bg-purple-500/20 text-purple-500"
    default:
      return "bg-gray-500/20 text-gray-500"
  }
}

export function ActivityFeed() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center space-x-4 p-4 rounded-sm border border-input hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer group/call"
        >
          <Avatar className="group-hover/call:scale-110 transition-transform duration-200">
            <AvatarImage src={`/placeholder-40x40.png`} />
            <AvatarFallback className="group-hover/call:bg-brand/10 transition-colors duration-200">
              {activity.caller
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="google-title-medium group-hover/call:text-brand transition-colors duration-200">
                {activity.caller}
              </p>
              <Badge
                variant="secondary"
                className={`${getStatusColor(activity.status)} transition-colors google-body-small duration-200`}
              >
                {activity.status}
              </Badge>
            </div>
            <p className="google-body-small text-muted-foreground group-hover/call:text-foreground transition-colors duration-200">
              {activity.issue}
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground group-hover/call:text-muted-foreground/80 transition-colors duration-200">
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
