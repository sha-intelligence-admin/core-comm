"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password')
  const [otpSent, setOtpSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Always redirect to organizations page after login
        // The organizations page will handle showing create/join options if needed
        router.push("/organizations")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      setOtpSent(true)
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="text-start space-y-2">
              <h1 className="google-headline-small">Welcome back</h1>
              <p className="text-muted-foreground google-body-small">Sign in to your account</p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-input hover:bg-primary/10 hover:text-primary bg-transparent"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading && <LoadingSpinner className="mr-2" size="sm" />}
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="w-full text-center">
              <p className="text-xs">or</p>
            </div>

            <div className="border-0 w-full">
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {otpSent && (
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      Check your email for a sign-in link. You can close this page.
                    </AlertDescription>
                  </Alert>
                )}

                <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'password' | 'otp')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="otp">Email Code</TabsTrigger>
                  </TabsList>

                  <TabsContent value="password">
                    <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text- font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="border-input focus:border-none focus:ring-primary/50 placeholder:text-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex justify-between w-full font-medium">
                      Password
                      <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:underline">
                        Forgot your password?
                      </Link>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="border-input focus:border-none focus:ring-primary/50 placeholder:text-input"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-input" /> : <Eye className="h-4 w-4 text-input" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full text-white bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading && <LoadingSpinner className="mr-2" size="sm" />}
                    Sign In
                  </Button>
                </form>
                  </TabsContent>

                  <TabsContent value="otp">
                    <form onSubmit={handleEmailOTP} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp-email" className="text- font-medium">
                          Email
                        </Label>
                        <Input
                          id="otp-email"
                          type="email"
                          placeholder="john@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading || otpSent}
                          className="border-input focus:border-none focus:ring-primary/50 placeholder:text-input"
                        />
                      </div>

                      <Button type="submit" className="w-full text-white bg-primary hover:bg-primary/90" disabled={loading || otpSent}>
                        {loading && <LoadingSpinner className="mr-2" size="sm" />}
                        <Mail className="mr-2 h-4 w-4" />
                        Send Sign-In Link
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="text-center text-sm py-4">
                  <span className="text-muted-foreground">Don&apos;t have an account? </span>
                  <Link href="/auth/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
    </>
  )
}
