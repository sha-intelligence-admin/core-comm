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
    <div className="rounded-sm bg-metricCard border border-input transition-all duration-300 group cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <Icon className="h-4 w-4 text-primary transition-colors duration-200" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground transition-transform duration-200">
          {value}
        </div>
        <p
          className={cn(
            "text-xs mt-2 transition-colors duration-200",
            trend === "up" ? "text-green-500" : "text-red-500",
          )}
        >
          {change} from last month
        </p>
      </CardContent>
    </div>
  )
}
