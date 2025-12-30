"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ShieldCheck } from "lucide-react"

export default function VerifyMFAPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Get the challenge ID (usually the latest one, or create a new one)
      const { data, error: factorsError } = await supabase.auth.mfa.listFactors()
      
      if (factorsError) throw factorsError
      
      const factors = data?.all || []
      const totpFactor = factors.find((f: any) => f.factor_type === 'totp' && f.status === 'verified')
      
      if (!totpFactor) {
        throw new Error("No verified 2FA factor found")
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id
      })

      if (challengeError) throw challengeError

      // 2. Verify the code
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code,
      })

      if (verifyError) throw verifyError

      toast({
        title: "Success",
        description: "Two-factor authentication verified",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading || code.length !== 6}>
              {loading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
              Verify
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
