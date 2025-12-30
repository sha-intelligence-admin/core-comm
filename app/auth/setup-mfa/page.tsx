"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ShieldAlert, Copy, CheckCircle2 } from "lucide-react"

export default function SetupMFAPage() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'init' | 'qr' | 'success'>('init')
  const [factorId, setFactorId] = useState<string>("")
  const [qrCode, setQrCode] = useState<string>("")
  const [secret, setSecret] = useState<string>("")
  const [verifyCode, setVerifyCode] = useState("")
  
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Auto-start enrollment on mount
    startEnrollment()
  }, [])

  const startEnrollment = async () => {
    setLoading(true)
    try {
      // 1. Check existing factors
      const { data: factorsData } = await supabase.auth.mfa.listFactors()
      const factors = factorsData?.all || []
      
      if (factors.length > 0) {
        // If already verified, skip setup
        const verifiedFactor = factors.find((f: any) => f.status === 'verified' && f.factor_type === 'totp')
        if (verifiedFactor) {
          setStep('success')
          setTimeout(() => {
            router.push("/dashboard")
            router.refresh()
          }, 2000)
          return
        }

        // Clean up ANY unverified factors to prevent collision
        const staleFactors = factors.filter((f: any) => f.status === 'unverified' && f.factor_type === 'totp')
        for (const factor of staleFactors) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id })
        }
      }

      // 2. Start new enrollment with a unique name to be safe
      const { data: enrollData, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Authenticator App (${new Date().toLocaleTimeString()})`,
      })

      if (error) throw error
      if (!enrollData) throw new Error('No enrollment data returned')

      setFactorId(enrollData.id)
      setQrCode(enrollData.totp.qr_code)
      setSecret(enrollData.totp.secret)
      setStep('qr')
    } catch (error: any) {
      console.error("Enrollment error:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const verifyEnrollment = async () => {
    setLoading(true)
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })

      if (challengeError) throw challengeError

      const { data: verify, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verifyCode,
      })

      if (verifyError) throw verifyError

      setStep('success')
      toast({
        title: "Success",
        description: "Two-factor authentication has been enabled.",
      })
      
      // Redirect after short delay
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 2000)

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    toast({
      description: "Secret copied to clipboard",
    })
  }

  if (step === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md border-input bg-page">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="google-body-large">Setup Complete!</h2>
            <p className="mt-2 google-body-small">Redirecting you to the dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="google-body-large">Setup 2FA</CardTitle>
          <CardDescription>
            Your organization requires Two-Factor Authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading && step === 'init' ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative h-48 w-48 overflow-hidden rounded-lg border bg-white p-2">
                  {qrCode && (
                    <img 
                      src={qrCode} 
                      alt="QR Code" 
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app
                </div>
              </div>

              <div className="space-y-2">
                <Label>Manual Entry Code</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted p-2 font-mono text-sm text-center">
                    {secret}
                  </code>
                  <Button size="icon" variant="outline" onClick={copySecret} type="button">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={verifyEnrollment} 
            disabled={loading || verifyCode.length !== 6}
            className="w-full"
          >
            {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
            Verify and Enable
          </Button>
        </CardFooter>
      </div>
    </div>
  )
}
