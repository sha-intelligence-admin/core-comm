import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  description: string
}

export function MetricCard({ title, value, change, icon: Icon, description }: MetricCardProps) {
  const isPositive = change.startsWith("+")

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className={`text-xs mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>{change} from last month</div>
      </CardContent>
    </Card>
  )
}
