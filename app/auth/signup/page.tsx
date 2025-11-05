"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Card is imported but unused, keeping for context
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Eye, EyeOff, CheckCircle } from "lucide-react"
import { SignupSchema } from "@/lib/validations"
import { ZodError } from "zod"
import axios from "axios";

// Using type alias for better readability
/** @typedef {object} FormData
 * @property {string} email
 * @property {string} password
 * @property {string} fullName
 * @property {string} phone
 */

export default function SignUpPage() {
  // Removed confirmPassword from state since the input is removed
  /** @type {[FormData, React.Dispatch<React.SetStateAction<FormData>>]} */
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  /** @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]} */
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    // Schema names usually use snake_case for consistency with databases,
    // so we map the camelCase state fields to the schema's expected names.
    const validationData = {
      email: formData.email,
      full_name: formData.fullName,
      phone: formData.phone,
      password: formData.password,
    }

    const result = SignupSchema.safeParse(validationData)

    if (!result.success) {
      // Display the first validation error message
      setError(result.error.issues[0]?.message || "Invalid input")
      return false
    }

    return true
  }

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      // The data we validate and will send to our profile API
      const profileData = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      }
      
      // Re-validate using parse for safety, although safeParse above should catch errors.
      // This throws if validation fails, which would be caught by the outer try/catch.
      const validated = SignupSchema.parse(profileData); 

      // 🔑 Step 1: Use Supabase's auth.signUp() for authentication only.
      const { data, error: authError } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
      });

      if (authError) {
        setError(authError.message)
        return // Exits before hitting setLoading(false) in finally
      }

      console.log("Supabase sign up data:", data.user)

      if (data.user) {
        // ✅ Step 2: After successful Supabase signup,
        // call your API to save the profile info.
        await axios.post("/api/auth/signup", {
          userId: data.user.id,
          fullName: validated.full_name, // Use validated data
          phone: validated.phone,         // Use validated data
          email: validated.email,
        });

        setSuccess(true);

        if (data.session) {
          setTimeout(() => {
            router.push("/onboarding");
          }, 2000);
        }
      }

    } catch (err) {
      console.error("Signup error:", err);
      // Check if the error is from Zod validation (if it failed silently before) or API.
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Validation failed.")
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred during registration.")
      } else {
        setError("An unexpected error occurred during registration.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    // Success view: Content only; outer layout provided by app/auth/layout.tsx
    return (
      <>
        <div className="text-start space-y-2">
          <h1 className="google-headline-small">Account Created</h1>
          <p className="text-muted-foreground google-body-small">Welcome to CoreComm! Let's set up your platform</p>
        </div>
        <div className="rounded-2xl">
          <div className="pt-6">
            <div className="space-y-4">
              {/* <div className="flex justify-center">
                <div className="flex aspect-square size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="size-8" />
                </div>
              </div> */}
              <div>
                <h2 className="text-2xl font-bold">Account Created!</h2>
                <p className="text-muted-foreground mt-2">
                  Welcome to CoreComm! Let's set up your AI customer support platform.
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={() => router.push("/onboarding")} className="w-full text-white bg-primary hover:bg-primary/90">
                  Setup Company
                </Button>
                <Button variant="outline" onClick={() => router.push("/join")} className="w-full">
                  Join Company
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="text-start space-y-2">
        <h1 className="google-headline-small">Get Started</h1>
        <p className="text-muted-foreground google-body-small">Create a new account</p>
      </div>

      <div className="">
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-input hover:bg-primary/10 hover:text-primary bg-transparent"
            // onClick={handleGoogleLogin} // Uncomment when implemented
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

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="google-title-small">
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
                className="border-input focus:border-none focus:ring-primary/50 placeholder:text-input"
              />
            </div>

            <div className="space-y-2">
              {/* Corrected htmlFor typo */}
              <Label htmlFor="phone" className="font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel" // Changed to tel for better mobile keyboard
                placeholder="(123) 456-7890"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
                className="border-input focus:border-none focus:ring-primary/50 placeholder:text-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">
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
                className="border-input focus:border-none focus:ring-primary/50 placeholder:text-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-medium">
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Removed Confirm Password Block */}

            <Button type="submit" className="w-full text-white bg-primary hover:bg-primary/90" disabled={loading}>
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
        </div>
      </div>
    </>
  )
}
