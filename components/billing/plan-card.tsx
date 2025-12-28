import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface PlanCardProps {
  name: string
  price: string
  description: string
  features?: string[]
  current?: boolean
  popular?: boolean
  onSubscribe: () => void
  loading?: boolean
  buttonText?: string
  period?: string
}

export function PlanCard({ name, price, description, features = [], current, popular, onSubscribe, loading, buttonText, period = '/month' }: PlanCardProps) {
  return (
    <div className={`flex border p-6 rounded-lg flex-col gap-4 ${current ? 'border-primary shadow-lg' : 'border-input'} ${popular ? 'border-primary/50 relative' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
          Most Popular
        </div>
      )}
      <div>
        <h1 className="google-headline-small">{name}</h1>
        <p className="text-muted-foreground google-body-small">{description}</p>
      </div>
      <div className="flex-1">
        <div className="text-3xl google-headline-large mb-6">{price}<span className="text-sm font-normal text-muted-foreground">{price !== 'Custom' ? period : ''}</span></div>
        {features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center text-sm">
                <Check className="mr-2 h-4 w-4 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <Button 
          className="w-full" 
          variant={current ? "outline" : "default"}
          disabled={current || loading}
          onClick={onSubscribe}
        >
          {current ? "Current Plan" : (buttonText || "Subscribe")}
        </Button>
      </div>
    </div>
  )
}
