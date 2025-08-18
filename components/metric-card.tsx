import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: LucideIcon
}

export function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn("text-xs", trend === "up" ? "text-green-600" : "text-red-600")}>{change} from last month</p>
      </CardContent>
    </Card>
  )
}
