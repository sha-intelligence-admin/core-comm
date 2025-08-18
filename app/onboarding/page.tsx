"use client"

import React from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Phone, Server, TestTube, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [mcpEndpoint, setMcpEndpoint] = useState("")
  const [apiKey, setApiKey] = useState("")
  const router = useRouter()

  const steps = [
    {
      id: 1,
      title: "Connect Phone Number",
      description: "Set up your customer support phone line",
      icon: Phone,
    },
    {
      id: 2,
      title: "Add MCP Integration",
      description: "Connect your first knowledge source",
      icon: Server,
    },
    {
      id: 3,
      title: "Test Call",
      description: "Verify everything works correctly",
      icon: TestTube,
    },
  ]

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/dashboard")
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  const progress = (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to CoreComm</h1>
          <p className="text-muted-foreground">
            Let's get your AI customer support platform set up in just a few steps
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="rounded-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {React.createElement(steps[currentStep - 1].icon, {
                className: "h-8 w-8 text-primary",
              })}
            </div>
            <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
            <CardDescription className="text-base">{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="rounded-xl bg-muted p-4">
                  <h4 className="font-medium mb-2">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• We'll configure your phone number for AI support</li>
                    <li>• Incoming calls will be routed to our AI system</li>
                    <li>• You can monitor all calls in real-time</li>
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Integration Name</Label>
                  <Input id="name" placeholder="Knowledge Base API" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint URL</Label>
                  <Input
                    id="endpoint"
                    type="url"
                    placeholder="https://api.yourcompany.com/knowledge"
                    value={mcpEndpoint}
                    onChange={(e) => setMcpEndpoint(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <Button variant="outline" className="w-full rounded-xl bg-transparent">
                  Test Connection
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Setup Complete!</h3>
                    <p className="text-muted-foreground">Your CoreComm platform is ready to handle customer calls</p>
                  </div>
                </div>

                <div className="rounded-xl bg-muted p-4 space-y-3">
                  <h4 className="font-medium">Test Call Instructions:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Call your configured phone number: {phoneNumber || "+1 (555) 123-4567"}</li>
                    <li>Ask a question about your products or services</li>
                    <li>The AI will respond using your knowledge base</li>
                    <li>Check the call log in your dashboard</li>
                  </ol>
                </div>

                <Button className="w-full rounded-xl" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={handleSkip} className="rounded-xl">
                Skip Setup
              </Button>
              <Button onClick={handleNext} className="rounded-xl">
                {currentStep === 3 ? "Complete Setup" : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
