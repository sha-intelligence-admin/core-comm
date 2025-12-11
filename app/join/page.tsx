"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function JoinPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [companyName, setCompanyName] = useState<string>("")

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // If not logged in, redirect to login
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Fetch company details
      const { data: userData } = await supabase
        .from('users')
        .select('company_id, company:company_id(name)')
        .eq('id', user.id)
        .single()

      const company = userData?.company as any
      const name = Array.isArray(company) ? company[0]?.name : company?.name

      if (name) {
        setCompanyName(name)
      }

      setLoading(false)
    }

    init()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to the Team!</CardTitle>
            <CardDescription className="text-base mt-2">
              You have successfully joined {companyName ? <strong>{companyName}</strong> : "the organization"}.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 flex gap-3 items-start">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Secure your account</p>
              <p className="text-blue-700/80">
                You are currently logged in via a secure link. We recommend setting a password for easier access in the future.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button 
            className="w-full h-11 text-base" 
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push("/settings")}
          >
            Set Password Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
