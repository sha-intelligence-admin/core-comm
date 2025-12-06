"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

function ProfileErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "Failed to create user profile"
  const next = searchParams.get("next") || "/dashboard"

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Profile Setup Error</CardTitle>
          <CardDescription>
            There was a problem creating your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {decodeURIComponent(error)}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This usually happens when:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>The database migration hasn&apos;t been run yet</li>
              <li>Row Level Security (RLS) policies are blocking inserts</li>
              <li>The users table doesn&apos;t exist</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Next steps:</p>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Contact your administrator about database setup</li>
              <li>Try completing your profile through onboarding</li>
              <li>Check the Supabase logs for more details</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={next}>
                Continue to Onboarding
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/auth/login">
                Back to Login
              </Link>
            </Button>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-800">
              <strong>For Admins:</strong> Make sure to run SETUP_DATABASE.sql in your Supabase SQL Editor and check that RLS policies allow authenticated users to insert their own profile.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfileErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <ProfileErrorContent />
    </Suspense>
  )
}
