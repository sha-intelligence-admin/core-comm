"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PlanCard } from "@/components/billing/plan-card"
import { CreditBalance } from "@/components/billing/credit-balance"
import { useToast } from "@/hooks/use-toast"

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get company
      const { data: membership } = await supabase
        .from('organization_memberships')
        .select('company_id')
        .eq('user_id', user.id)
        .single()
      
      if (membership) {
        setCompanyId(membership.company_id)
        
        // Get Subscription
        const { data: sub } = await supabase
          .from('billing_subscriptions')
          .select('*')
          .eq('company_id', membership.company_id)
          .single()
        setSubscription(sub)

        // Get Wallet
        const { data: wal } = await supabase
          .from('wallets')
          .select('*')
          .eq('company_id', membership.company_id)
          .single()
        setWallet(wal)
      }
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const handleSubscribe = async (priceId: string) => {
    if (!companyId) return
    
    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          priceId,
          mode: 'subscription'
        })
      })
      
      if (!res.ok) throw new Error('Failed to create session')
      
      const { url } = await res.json()
      window.location.href = url
    } catch (error) {
      toast({ title: "Error", description: "Failed to start checkout", variant: "destructive" })
    }
  }

  const handleTopUp = async (amountCents: number) => {
    if (!companyId) return

    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          amount: amountCents,
          mode: 'payment'
        })
      })
      
      if (!res.ok) throw new Error('Failed to create session')

      const { url } = await res.json()
      window.location.href = url
    } catch (error) {
      toast({ title: "Error", description: "Failed to start checkout", variant: "destructive" })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Usage</h1>
        <p className="text-muted-foreground">Manage your subscription and credit balance.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <h2 className="text-xl font-semibold">Subscription Plans</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <PlanCard
              name="Starter"
              price="$49"
              description="Perfect for small businesses just getting started."
              features={["1 AI Agent", "1 Phone Number", "120 mins/mo included", "Basic Support"]}
              current={subscription?.plan_id === 'starter'}
              onSubscribe={() => handleSubscribe('price_starter_id_placeholder')} // TODO: Replace with real ID
            />
            <PlanCard
              name="Growth"
              price="$199"
              description="For growing teams with higher volume."
              features={["5 AI Agents", "3 Phone Numbers", "600 mins/mo included", "Priority Support"]}
              current={subscription?.plan_id === 'growth'}
              onSubscribe={() => handleSubscribe('price_growth_id_placeholder')} // TODO: Replace with real ID
            />
          </div>
        </div>

        <div>
          <CreditBalance 
            balance={wallet?.balance || 0} 
            onTopUp={handleTopUp}
          />
        </div>
      </div>
    </div>
  )
}
