import { useState } from "react"
import { Button } from "@/components/ui/button"
// import { Card, div, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface CreditBalanceProps {
  balance: number // in cents
  onTopUp: (amount: number) => Promise<void>
}

export function CreditBalance({ balance, onTopUp }: CreditBalanceProps) {
  const [amount, setAmount] = useState("10")
  const [loading, setLoading] = useState(false)

  const handleTopUp = async () => {
    setLoading(true)
    try {
      await onTopUp(parseFloat(amount) * 100) // Convert to cents
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6 border border-input rounded-lg">
      <div>
        <h2 className="google-headline-small">Credit Balance</h2>
        <p className="text-muted-foreground google-body-small">Available funds for usage-based charges</p>
      </div>
      <div>
        <div className="text-4xl font-bold mb-6">
          ${(balance / 100).toFixed(2)}
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Top Up Amount ($)</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                min="10"
              />
              <Button onClick={handleTopUp} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Funds
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Auto-recharge is disabled. You will be notified when balance is low.
          </p>
        </div>
      </div>
    </div>
  )
}
