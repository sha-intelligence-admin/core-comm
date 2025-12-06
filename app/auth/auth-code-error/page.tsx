import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
  // Content only; outer layout provided by app/auth/layout.tsx
  return (
    <>
      <div className="text-start space-y-2">
        <h1 className="google-headline-small">Authentication Error</h1>
        <p className="text-muted-foreground google-body-small">There was an issue with your authentication request</p>
      </div>

      <div className="rounded-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Authentication Failed
          </div>
          <div>Please try signing in again</div>
        </div>
        <div className="space-y-4">
          <Alert variant="destructive" className="my-4">
            <AlertDescription>
              The authentication link may have expired or been used already.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/auth/signup">Create New Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
