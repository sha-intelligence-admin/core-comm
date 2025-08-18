"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HeadphonesIcon, AlertCircle, ExternalLink, Copy } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeadphonesIcon className="size-6" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Setup Required</h1>
          <p className="text-muted-foreground">Configure Supabase to enable authentication</p>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Supabase Configuration Missing
            </CardTitle>
            <CardDescription>
              To use CoreComm with authentication, you need to set up Supabase and configure your environment variables.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                The application is currently running without authentication. Follow the steps below to enable full
                functionality.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Create a Supabase Project</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Go to Supabase and create a new project for your CoreComm application.
                </p>
                <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Link href="https://supabase.com/dashboard" target="_blank">
                    <ExternalLink className="h-4 w-4" />
                    Open Supabase Dashboard
                  </Link>
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Get Your Project Credentials</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  From your Supabase project settings, copy your Project URL and anon public key.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 3: Configure Environment Variables</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Create a <code className="bg-muted px-1 rounded">.env.local</code> file in your project root with:
                </p>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground"># .env.local</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        navigator.clipboard.writeText(`NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`)
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 4: Enable Authentication</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  In your Supabase dashboard, go to Authentication → Settings and configure:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Enable email authentication</li>
                  <li>• Set site URL to your domain</li>
                  <li>• Configure redirect URLs</li>
                  <li>• (Optional) Enable OAuth providers</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 5: Restart Your Application</h3>
                <p className="text-sm text-muted-foreground">
                  After adding the environment variables, restart your development server to apply the changes.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/onboarding">Continue Without Auth (Demo Mode)</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <Link href="/" onClick={() => window.location.reload()}>
                    Refresh After Setup
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
