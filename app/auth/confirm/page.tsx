"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CheckCircle, XCircle, Mail } from "lucide-react"

function ConfirmEmailContent() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/organizations'
  const supabase = createClient()
  const effectRan = useRef(false)

  const handleConfirm = async () => {
    if (!code) {
      setStatus('error')
      setMessage('Missing confirmation code')
      return
    }

    setStatus('loading')
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        // If error, check if we actually have a session anyway
        // This handles cases where the code might have been consumed but session established
        // or if the user is already logged in and verified
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
           console.log("Session found despite error, proceeding as success")
           setStatus('success')
           setTimeout(() => {
             router.push(next)
           }, 2000)
           return
        }
        throw error
      }
      
      setStatus('success')
      // Wait a moment to show success state before redirecting
      setTimeout(() => {
        router.push(next)
      }, 2000)
    } catch (error: any) {
      console.error("Verification error:", error)
      setStatus('error')
      // Improve error message for common cases
      if (error.message?.includes("code") || error.message?.includes("expired")) {
        setMessage("Link expired or already used. You may already be verified.")
      } else {
        setMessage(error.message || 'Failed to verify email')
      }
    }
  }

  // Auto-verify on mount
  useEffect(() => {
    if (!code) {
      setStatus('error')
      setMessage('Invalid verification link')
    } else if (!effectRan.current) {
      effectRan.current = true
      handleConfirm()
    }
  }, [code])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>Confirm Email</CardTitle>
        <CardDescription>
          Verifying your email address...
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* Removed manual button since we auto-verify */}

        {(status === 'loading' || status === 'idle') && (
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground">Verifying...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-2 text-green-600">
            <CheckCircle className="h-8 w-8" />
            <p className="font-medium">Email verified successfully!</p>
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-2 text-destructive w-full">
            <XCircle className="h-8 w-8" />
            <p className="font-medium">Verification Failed</p>
            <p className="text-sm text-center text-muted-foreground">{message}</p>
            <Button variant="outline" onClick={() => router.push('/auth/login')} className="mt-2 w-full">
              Back to Login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Suspense fallback={<LoadingSpinner />}>
        <ConfirmEmailContent />
      </Suspense>
    </div>
  )
}
