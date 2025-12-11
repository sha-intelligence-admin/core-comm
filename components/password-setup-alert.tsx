"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function PasswordSetupAlert() {
  const [show, setShow] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkPasswordStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      // Check if user logged in via magic link or otp only
      // The 'amr' (Authentication Method Reference) array tells us how they logged in
      const amr = session.user?.app_metadata?.provider ? [] : (session.user as any)?.amr || []
      
      // If they logged in via magiclink and don't have a password set...
      // Note: Supabase doesn't easily expose "has_password" flag on the user object directly in all cases
      // But we can infer it if they are new or if we track it.
      // For now, we'll show this if they are currently in a session that started via magiclink
      // and we haven't dismissed it.
      
      const isMagicLinkSession = amr.some((m: any) => m.method === 'magiclink' || m.method === 'otp')
      const isPasswordSession = amr.some((m: any) => m.method === 'password')
      
      // If they are in a magic link session and NOT a password session, prompt them
      if (isMagicLinkSession && !isPasswordSession) {
        // Check local storage to see if they dismissed it
        const dismissed = localStorage.getItem('dismissed_password_alert')
        if (!dismissed) {
          setShow(true)
        }
      }
    }

    checkPasswordStatus()
  }, [])

  if (!show) return null

  return (
    <Alert className="mb-6 border-yellow-200 bg-yellow-50 text-yellow-900">
      <ShieldAlert className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Set up your password</AlertTitle>
      <AlertDescription className="flex items-center justify-between mt-2">
        <span>
          You are currently logged in via a temporary link. Set a password to ensure you can always access your account.
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-yellow-200 bg-white text-yellow-900 hover:bg-yellow-100"
            onClick={() => router.push('/settings')}
          >
            Set Password
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-yellow-700 hover:bg-yellow-100 hover:text-yellow-900"
            onClick={() => {
              setShow(false)
              localStorage.setItem('dismissed_password_alert', 'true')
            }}
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
