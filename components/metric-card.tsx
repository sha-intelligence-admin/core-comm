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
    <Card className="rounded-2xl bg-brand text-white border-brand hover:bg-brand/90 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
        <Icon className="h-4 w-4 text-white/80 group-hover:text-white transition-colors duration-200" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-200">
          {value}
        </div>
        <p
          className={cn(
            "text-xs transition-colors duration-200",
            trend === "up" ? "text-green-200 group-hover:text-green-100" : "text-red-200 group-hover:text-red-100",
          )}
        >
          {change} from last month
        </p>
      </CardContent>
    </Card>
  )
}
