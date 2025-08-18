import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, RefreshCw, type LucideIcon } from "lucide-react"

interface Integration {
  id: string
  name: string
  type: string
  endpoint: string
  status: "connected" | "error" | "pending"
  lastSync: string
  icon: LucideIcon
}

interface IntegrationCardProps {
  integration: Integration
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "connected":
      return "bg-green-100 text-green-800"
    case "error":
      return "bg-red-100 text-red-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const Icon = integration.icon

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{integration.name}</CardTitle>
            <CardDescription>{integration.type}</CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Now
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="secondary" className={getStatusColor(integration.status)}>
              {integration.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Sync</span>
            <span className="text-sm">{integration.lastSync}</span>
          </div>
          <div className="text-xs text-muted-foreground truncate">{integration.endpoint}</div>
        </div>
      </CardContent>
    </Card>
  )
}
