import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HeadphonesIcon, AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeadphonesIcon className="size-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Authentication Error</h1>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Authentication Failed
            </CardTitle>
            <CardDescription>There was an issue with your authentication request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                The authentication link may have expired or been used already. Please try signing in again.
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
