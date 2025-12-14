import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

interface PlanCardProps {
  name: string
  price: string
  description: string
  features: string[]
  current?: boolean
  onSubscribe: () => void
  loading?: boolean
}

export function PlanCard({ name, price, description, features, current, onSubscribe, loading }: PlanCardProps) {
  return (
    <Card className={`flex flex-col ${current ? 'border-primary shadow-lg' : ''}`}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-3xl font-bold mb-6">{price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center text-sm">
              <Check className="mr-2 h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={current ? "outline" : "default"}
          disabled={current || loading}
          onClick={onSubscribe}
        >
          {current ? "Current Plan" : "Subscribe"}
        </Button>
      </CardFooter>
    </Card>
  )
}
