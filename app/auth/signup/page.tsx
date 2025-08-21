"use client"

import type React from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"
import { HeadphonesIcon, Eye, EyeOff, CheckCircle } from "lucide-react"
import { SignupSchema } from "@/lib/validations"
import axios from "axios";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    
    // Use Zod schema for validation
    const result = SignupSchema.safeParse({
      email: formData.email,
      full_name: formData.fullName,
      phone: formData.phone,
      password: formData.password,
    })
    
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid input")
      return false
    }
    
    return true
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const validated = SignupSchema.parse({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      // 🔑 Step 1: Use Supabase's auth.signUp() for authentication only.
      // We are no longer passing profile data here.
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message)
        setLoading(false) // Set loading to false on error
        return
      }

      console.log("Supabase sign up data:", data.user)

      if (data.user) {
        // ✅ Step 2: After successful Supabase signup,
        // call your API to save the profile info.
        // We pass the user's unique ID to link the tables.
        await axios.post("/api/auth/signup", {
          userId: data.user.id,
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
        });

        setSuccess(true);

        if (data.session) {
          setTimeout(() => {
            router.push("/onboarding");
          }, 2000);
        }
      }

    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md rounded-2xl border-brand/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex aspect-square size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="size-8" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-brand">Account Created!</h2>
                <p className="text-muted-foreground mt-2">
                  Welcome to CoreComm! Let's set up your AI customer support platform.
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={() => router.push("/onboarding")} className="w-full bg-brand hover:bg-brand/90">
                  Setup Company
                </Button>
                <Button variant="outline" onClick={() => router.push("/join")} className="w-full border-brand/30 hover:bg-brand/10 hover:text-brand">
                  Join Company
                </Button>
                {/* <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="w-full border-brand/30 hover:bg-brand/10 hover:text-brand"
                >
                  Skip Setup (Go to Dashboard)
                </Button> */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-brand text-white">
              <HeadphonesIcon className="size-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-brand">Join CoreComm</h1>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>

        <Card className="rounded-2xl border-brand/20">
          <CardHeader className="bg-gradient-to-r from-brand/5 to-transparent rounded-t-2xl">
            <CardTitle className="text-brand">Create Account</CardTitle>
            <CardDescription>Enter your information to create your CoreComm account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-500 bg-red-300 text-red-700">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-brand/80 font-medium">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="border-brand/20 focus:border-brand focus:ring-brand/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone``" className="text-brand/80 font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(123) 456-7890"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="border-brand/20 focus:border-brand focus:ring-brand/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand/80 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="border-brand/20 focus:border-brand focus:ring-brand/20"
                />
              </div>



              <div className="space-y-2">
                <Label htmlFor="password" className="text-brand/80 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="border-brand/20 focus:border-brand focus:ring-brand/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-brand/80 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="border-brand/20 focus:border-brand focus:ring-brand/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-brand hover:bg-brand/90" disabled={loading}>
                {loading && <LoadingSpinner className="mr-2" size="sm" />}
                Create Account
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/auth/login" className="text-brand hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
