"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, QrCode, CheckCircle2, Copy } from "lucide-react"
import Image from "next/image"

export function MFAEnrollment() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'init' | 'qr' | 'verify'>('init')
  const [factorId, setFactorId] = useState<string>("")
  const [qrCode, setQrCode] = useState<string>("")
  const [secret, setSecret] = useState<string>("")
  const [verifyCode, setVerifyCode] = useState("")
  const [isEnrolled, setIsEnrolled] = useState(false)
  
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    checkEnrollmentStatus()
  }, [])

  const checkEnrollmentStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.factors?.some(f => f.status === 'verified')) {
      setIsEnrolled(true)
    }
  }

  const startEnrollment = async () => {
    setLoading(true)
    try {
      // 1. Clean up any stale/unverified factors first
      const { data: factorsData } = await supabase.auth.mfa.listFactors()
      const factors = factorsData?.all || []
      if (factors.length > 0) {
        const unverifiedFactors = factors.filter((f: any) => f.status === 'unverified' && f.factor_type === 'totp')
        for (const factor of unverifiedFactors) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id })
        }
      }

      // 2. Start new enrollment
      const { data: enrollData, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      })

      if (error) throw error
      if (!enrollData) throw new Error('No enrollment data returned')

      setFactorId(enrollData.id)
      setQrCode(enrollData.totp.qr_code)
      setSecret(enrollData.totp.secret)
      setStep('qr')
    } catch (error: any) {
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

      setIsEnrolled(true)
      setIsOpen(false)
      toast({
        title: "Success",
        description: "Two-factor authentication has been enabled.",
      })
      setStep('init')
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

  if (isEnrolled) {
    return (
      <div className="flex items-center gap-2 text-primary px-3 py-2 rounded-md">
        {/* <CheckCircle2 className="h-5 w-5" /> */}
        <span className="font-medium">2FA is enabled on your account</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={async () => {
            // Unenroll logic would go here
            // For now, we just show a toast that it's managed by admin or requires support
            toast({ description: "To disable 2FA, please contact your administrator." })
          }}
        >
          Disable
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={startEnrollment}>
          <QrCode className="mr-2 h-4 w-4" />
          Setup 2FA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Protect your account by adding an extra layer of security.
          </DialogDescription>
        </DialogHeader>

        {step === 'qr' && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative h-48 w-48 overflow-hidden rounded-lg border bg-white p-2">
                {/* Supabase returns an SVG string for the QR code */}
                <img 
                  src={qrCode} 
                  alt="QR Code" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </div>
            </div>

            <div className="space-y-2">
              <Label>Can't scan? Enter this code manually:</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted p-2 font-mono text-sm">
                  {secret}
                </code>
                <Button size="icon" variant="outline" onClick={copySecret}>
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
          </div>
        )}

        <DialogFooter>
          {step === 'qr' && (
            <Button 
              onClick={verifyEnrollment} 
              disabled={loading || verifyCode.length !== 6}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify and Enable
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
