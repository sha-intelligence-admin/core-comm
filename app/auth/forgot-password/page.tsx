"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"
import { HeadphonesIcon, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md rounded-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex aspect-square size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="size-8" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Check Your Email</h2>
                <p className="text-muted-foreground mt-2">
                  We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset
                  your password.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeadphonesIcon className="size-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">Enter your email to receive a password reset link</p>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>We'll send you a link to reset your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <LoadingSpinner className="mr-2" size="sm" />}
                Send Reset Link
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
