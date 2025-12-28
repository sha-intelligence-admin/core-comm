"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PlanCard } from "@/components/billing/plan-card"
import { CreditBalance } from "@/components/billing/credit-balance"
import { UsageStats } from "@/components/billing/usage-stats"
import { AddonsSection } from "@/components/billing/addons-section"
import { ServicesSection } from "@/components/billing/services-section"
import { useToast } from "@/hooks/use-toast"
import { PRICING_TIERS, PlanId } from "@/app/constants/pricing"

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [subscribingId, setSubscribingId] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [usage, setUsage] = useState<any>(null)
  const [addons, setAddons] = useState<any[]>([])
  const [companyId, setCompanyId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get company from users table
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()
      
      if (userData?.company_id) {
        setCompanyId(userData.company_id)
        
        // Get Subscription
        const { data: sub } = await supabase
          .from('billing_subscriptions')
          .select('*')
          .eq('company_id', userData.company_id)
          .single()
        setSubscription(sub)

        // Get Wallet
        const { data: wal } = await supabase
          .from('wallets')
          .select('*')
          .eq('company_id', userData.company_id)
          .single()
        setWallet(wal)

        // Get Addons
        const { data: addonsData } = await supabase
          .from('billing_addons')
          .select('*')
          .eq('company_id', userData.company_id)
          .eq('status', 'active')
        setAddons(addonsData || [])

        // Get Usage Period
        if (sub) {
            const now = new Date().toISOString()
            const { data: usageData } = await supabase
            .from('billing_usage_periods')
            .select('*')
            .eq('subscription_id', sub.id)
            .lte('period_start', now)
            .gte('period_end', now)
            .single()
            setUsage(usageData)
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const handlePurchaseAddon = async (addonId: string) => {
    if (!companyId) return

    try {
      const res = await fetch('/api/billing/purchase-addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, addonId })
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || 'Failed to purchase addon')
      }

      toast({ title: "Success", description: "Add-on purchased successfully!" })
      window.location.reload()
    } catch (error: any) {
      console.error(error)
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!companyId) {
      toast({ title: "Error", description: "No company found. Please contact support.", variant: "destructive" })
      return
    }
    
    setSubscribingId(planId)
    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          planId,
        })
      })
      
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || 'Failed to subscribe')
      }
      
      const data = await res.json()
      
      // If we got a payment link (e.g. for 3DS or redirect), handle it
      if (data.link) {
        window.location.href = data.link
        return
      }

      toast({ title: "Success", description: "Subscription updated!" })
      window.location.reload()
      
    } catch (error: any) {
      console.error(error)
      toast({ title: "Error", description: error.message || "Failed to subscribe", variant: "destructive" })
    } finally {
      setSubscribingId(null)
    }
  }

  const handleTopUp = async (amountCents: number) => {
    if (!companyId) {
      toast({ title: "Error", description: "No company found. Please contact support.", variant: "destructive" })
      return
    }

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
      
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || 'Failed to create session')
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error("No payment URL returned")
      }
    } catch (error: any) {
      console.error(error)
      toast({ title: "Error", description: error.message || "Failed to start checkout", variant: "destructive" })
    }
  }

  if (loading) return <div>Loading...</div>

  const currentPlan = subscription ? PRICING_TIERS[subscription.plan_id as PlanId] : null;

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl google-headline-medium tracking-tight">Billing & Usage</h1>
          <p className="text-muted-foreground">Manage your subscription, usage, and billing details.</p>
        </div>
      </div>

      {/* Overview Section: Balance & Usage */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreditBalance 
            balance={wallet?.balance || 0} 
            onTopUp={handleTopUp}
          />
        </div>
        {subscription && (
          <div className="lg:col-span-2">
             <UsageStats 
                voiceMinutesUsed={usage?.voice_minutes_used || 0}
                voiceMinutesLimit={currentPlan?.limits.voice_minutes || 0}
                smsUsed={usage?.sms_count_used || 0}
                smsLimit={currentPlan?.limits.sms_messages || 0}
                emailsUsed={usage?.email_count_used || 0}
                emailsLimit={currentPlan?.limits.emails || 0}
             />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl google-headline-medium">Subscription Plans</h2>
          <p className="text-muted-foreground">Choose the plan that scales with your business.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <PlanCard
              name="Starter"
              price="$99"
              description="For solopreneurs testing the waters."
              features={["240 mins", "1 Phone Number", "Email support"]}
              current={subscription?.plan_id === 'starter'}
              loading={subscribingId === 'starter'}
              onSubscribe={() => handleSubscribe('starter')}
            />
            <PlanCard
              name="Professional"
              price="$299"
              description="For growing companies."
              features={["600 mins", "2 Phone Numbers", "Call recording", "Priority support", "Basic analytics"]}
              current={subscription?.plan_id === 'professional'}
              popular={true}
              loading={subscribingId === 'professional'}
              onSubscribe={() => handleSubscribe('professional')}
            />
            <PlanCard
              name="Professional+"
              price="$899"
              description="For scaling teams."
              features={["4,000 mins", "5 Phone Numbers", "Advanced analytics", "CRM integrations", "Human escalation"]}
              current={subscription?.plan_id === 'professional_plus'}
              loading={subscribingId === 'professional_plus'}
              onSubscribe={() => handleSubscribe('professional_plus')}
            />
            <PlanCard
              name="Enterprise"
              price="Custom"
              description="For large enterprises."
              features={["Custom minutes", "Dedicated infrastructure", "White-label", "SLA guarantees"]}
              current={subscription?.plan_id === 'enterprise'}
              onSubscribe={() => window.location.href = 'mailto:sales@corecomm.com'}
              buttonText="Contact Sales"
            />
        </div>
      </div>
      
      <div className="space-y-6">
         <AddonsSection 
            purchasedAddons={addons} 
            onPurchase={handlePurchaseAddon} 
          />
      </div>

      <div className="space-y-6">
         <ServicesSection />
      </div>
    </div>
  )
}
