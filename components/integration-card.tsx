"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Settings, Trash2, RefreshCw } from "lucide-react"

interface Integration {
  id: string
  name: string
  endpoint: string
  status: "connected" | "error" | "disconnected"
  lastSync: string
  description: string
}

interface IntegrationCardProps {
  integration: Integration
  onDelete: (id: string) => void
}

export function IntegrationCard({ integration, onDelete }: IntegrationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "disconnected":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return "🟢"
      case "error":
        return "🔴"
      case "disconnected":
        return "⚫"
      default:
        return "⚫"
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base">{integration.name}</CardTitle>
          <CardDescription className="text-sm">{integration.description}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </DropdownMenuItem>
            <DropdownMenuItem>
              <RefreshCw className="mr-2 h-4 w-4" />
              Test Connection
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(integration.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={getStatusColor(integration.status)}>
              <span className="mr-1">{getStatusIcon(integration.status)}</span>
              {integration.status}
            </Badge>
            <span className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">{integration.endpoint}</div>
        </div>
      </CardContent>
    </Card>
  )
}
