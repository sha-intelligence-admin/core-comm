"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import { useSecuritySettings } from "@/hooks/use-security-settings"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function TwoFactorEnforcementAlert() {
  const [showPrompt, setShowPrompt] = useState(false)
  const { settings, isLoading } = useSecuritySettings()
  const supabase = createClient()

  useEffect(() => {
    const checkStatus = async () => {
      if (isLoading || !settings?.two_factor_enabled) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if user already has factors enrolled
      const factors = user.factors || []
      const hasVerifiedFactors = factors.some(f => f.status === 'verified')

      // If company enforces 2FA but user hasn't set it up
      if (!hasVerifiedFactors) {
        setShowPrompt(true)
      }
    }

    checkStatus()
  }, [settings, isLoading, supabase])

  if (!showPrompt) return null

  return (
    <AlertDialog open={showPrompt}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-6 w-6" />
            <AlertDialogTitle>Security Action Required</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Your organization requires Two-Factor Authentication (2FA) to be enabled for all accounts.
            <br /><br />
            You must set this up immediately to continue accessing the dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button 
            variant="destructive" 
            className="w-full"
            asChild
          >
            <Link href="/auth/setup-mfa">
              Setup 2FA Now
            </Link>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
