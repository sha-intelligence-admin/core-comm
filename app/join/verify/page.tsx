"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, ArrowRight } from "lucide-react"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectUrl = searchParams.get("redirect")

  const handleContinue = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl
    } else {
      router.push("/auth/login")
    }
  }

  if (!redirectUrl) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Invalid Link</CardTitle>
          <CardDescription>
            The invitation link appears to be invalid or missing required information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/")} className="w-full">
            Return Home
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-none shadow-xl">
      <CardHeader className="text-center space-y-4 pb-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">Security Check</CardTitle>
          <CardDescription className="text-base mt-2">
            To protect your account, please click the button below to verify your invitation.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Button 
          className="w-full h-11 text-base" 
          onClick={handleContinue}
        >
          Verify & Join Team
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-4">
          This extra step helps prevent automated systems from expiring your invitation link.
        </p>
      </CardContent>
    </Card>
  )
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Suspense fallback={<LoadingSpinner />}>
        <VerifyContent />
      </Suspense>
    </div>
  )
}
