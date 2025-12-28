import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, RefreshCw, type LucideIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
      return "bg-green-500/20 text-green-500 "
    case "error":
      return "bg-red-500/20 text-red-500"
    case "pending":
      return "bg-yellow-500/20 text-yellow-500 "
    default:
      return "bg-gray-500/20 text-gray-500 "
  }
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const Icon = integration.icon
  const { toast } = useToast()
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch(`/api/integrations/${integration.id}/sync`, {
        method: 'POST',
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to sync')
      }

      toast({
        title: "Sync started",
        description: `Synchronization for ${integration.name} has started.`,
      })
    } catch (error) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card className="group rounded-sm border-input bg-metricCard transition-all duration-300 hover:border-primary/50">
      <CardHeader className="flex flex-row items-start justify-between gap-4 rounded-t-sm pb-0">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="google-title-medium text-foreground">{integration.name}</div>
            <div className="google-body-medium text-muted-foreground">
              {integration.type}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-sm border border-transparent text-muted-foreground hover:border-input hover:bg-muted/40"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2 text-sm">
              <Edit className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm" onClick={handleSync} disabled={syncing}>
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sync now
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm text-red-600 focus:text-red-600">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3 rounded-b-sm pt-4">
        <div className="flex items-center justify-between rounded-sm border border-transparent bg-muted/40 px-3 py-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant="secondary" className={`${getStatusColor(integration.status)} capitalize`}>
            {integration.status}
          </Badge>
        </div>
        <div className="flex items-center justify-between rounded-sm border border-transparent bg-muted/40 px-3 py-2">
          <span className="text-sm text-muted-foreground">Last sync</span>
          <span className="google-label-medium text-foreground">{integration.lastSync}</span>
        </div>
        <div className="rounded-sm border border-dashed border-input/60 bg-card px-3 py-2 text-xs text-muted-foreground">
          {integration.endpoint}
        </div>
      </CardContent>
    </Card>
  )
}
