
"use client"

import { useState } from "react"
import { ADD_ONS } from "@/app/constants/pricing"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus } from "lucide-react"

interface AddonsSectionProps {
  purchasedAddons: any[]
  onPurchase: (addonId: string) => Promise<void>
}

export function AddonsSection({ purchasedAddons, onPurchase }: AddonsSectionProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handlePurchase = async (addonId: string) => {
    setLoadingId(addonId)
    try {
      await onPurchase(addonId)
    } finally {
      setLoadingId(null)
    }
  }

  const getDescription = (id: string) => {
    switch (id) {
      case 'phone_number': return "Add an extra phone number to your plan."
      case 'call_recording': return "Enable call recording storage."
      case 'analytics': return "Unlock advanced analytics and reporting."
      case 'custom_voice_training': return "Train a custom AI voice model."
      case 'priority_support': return "Get priority support with SLA guarantees."
      case 'white_label': return "Remove CoreComm branding from the interface."
      default: return ""
    }
  }

  return (
    <div className="space-y-4">
      <h2 className=" google-headline-medium">Add-Ons</h2>
      <div className="bg-card">
        {Object.values(ADD_ONS).map((addon) => {
          const purchasedCount = purchasedAddons
            .filter(a => a.type === addon.id)
            .reduce((sum, a) => sum + a.quantity, 0)

          return (
            <div key={addon.id} className="border border-input rounded-lg my-2 hover:border-primary flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="google-body-large">{addon.name}</h3>
                  {purchasedCount > 0 && <Badge variant="secondary">{purchasedCount} Active</Badge>}
                </div>
                <p className="text-sm google-body-small text-muted-foreground">{getDescription(addon.id)}</p>
              </div>
              <div className="flex items-center gap-4 min-w-[200px] justify-end">
                <div className="text-lg google-body-large">${addon.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePurchase(addon.id)}
                  disabled={loadingId === addon.id}
                >
                  {loadingId === addon.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Add
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
