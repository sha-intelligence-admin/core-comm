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
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "error":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const Icon = integration.icon

  return (
    <Card className="rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-brand/50 group cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 group-hover:bg-brand/5 transition-colors duration-300 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-brand/10 group-hover:bg-brand/20 group-hover:scale-110 transition-all duration-300">
            <Icon className="h-5 w-5 text-brand group-hover:text-brand/80 transition-colors duration-200" />
          </div>
          <div>
            <CardTitle className="text-base group-hover:text-brand transition-colors duration-200">
              {integration.name}
            </CardTitle>
            <CardDescription className="group-hover:text-foreground/80 transition-colors duration-200">
              {integration.type}
            </CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 group-hover:bg-brand/10 transition-colors duration-200"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="hover:bg-brand/10 hover:text-brand transition-colors duration-200">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-brand/10 hover:text-brand transition-colors duration-200">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Now
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="group-hover:bg-brand/5 transition-colors duration-300 rounded-b-2xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded-lg group-hover:bg-white/50 transition-colors duration-200">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge
              variant="secondary"
              className={`${getStatusColor(integration.status)} transition-all duration-200 group-hover:scale-105`}
            >
              {integration.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg group-hover:bg-white/50 transition-colors duration-200">
            <span className="text-sm text-muted-foreground">Last Sync</span>
            <span className="text-sm group-hover:text-brand transition-colors duration-200">
              {integration.lastSync}
            </span>
          </div>
          <div className="text-xs text-muted-foreground truncate p-2 rounded-lg group-hover:bg-white/50 group-hover:text-foreground/70 transition-colors duration-200">
            {integration.endpoint}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
