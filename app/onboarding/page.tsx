"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Phone, Server, TestTube, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react"

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
    title: "Test Your Setup",
    description: "Make a test call to verify everything works",
    icon: TestTube,
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [mcpEndpoint, setMcpEndpoint] = useState("")
  const [mcpApiKey, setMcpApiKey] = useState("")
  const [testCallStatus, setTestCallStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const router = useRouter()

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTestCall = async () => {
    setTestCallStatus("testing")
    // Simulate API call
    setTimeout(() => {
      setTestCallStatus("success")
    }, 2000)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                This will be your customer support line. We'll configure it for AI handling.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl">
              <h4 className="font-medium mb-2">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• We'll provision a dedicated phone line</li>
                <li>• Configure call routing to our AI system</li>
                <li>• Set up call recording and transcription</li>
              </ul>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">MCP Server Endpoint</Label>
              <Input
                id="endpoint"
                placeholder="https://api.yourcompany.com/mcp"
                value={mcpEndpoint}
                onChange={(e) => setMcpEndpoint(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apikey">API Key</Label>
              <Input
                id="apikey"
                type="password"
                placeholder="Enter your API key"
                value={mcpApiKey}
                onChange={(e) => setMcpApiKey(e.target.value)}
              />
            </div>
            <div className="p-4 bg-muted/50 rounded-xl">
              <h4 className="font-medium mb-2">Popular Integrations</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Button variant="outline" size="sm">
                  Salesforce
                </Button>
                <Button variant="outline" size="sm">
                  HubSpot
                </Button>
                <Button variant="outline" size="sm">
                  Zendesk
                </Button>
                <Button variant="outline" size="sm">
                  Custom API
                </Button>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              {testCallStatus === "idle" && (
                <>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <TestTube className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Ready to Test</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll make a test call to verify your setup is working correctly
                    </p>
                  </div>
                  <Button onClick={handleTestCall} className="gap-2">
                    <TestTube className="w-4 h-4" />
                    Start Test Call
                  </Button>
                </>
              )}

              {testCallStatus === "testing" && (
                <>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <TestTube className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Testing in Progress</h3>
                    <p className="text-sm text-muted-foreground">Making test call and verifying integrations...</p>
                  </div>
                </>
              )}

              {testCallStatus === "success" && (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-600">Test Successful!</h3>
                    <p className="text-sm text-muted-foreground">Your CoreComm setup is ready for customer calls</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl text-left">
                    <h4 className="font-medium text-green-800 mb-2">Test Results</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✓ Phone line configured successfully</li>
                      <li>✓ MCP integration connected</li>
                      <li>✓ AI response generated</li>
                      <li>✓ Call transcription working</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to CoreComm</h1>
          <p className="text-muted-foreground">
            Let's get your AI customer support platform set up in just a few steps
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex justify-center space-x-8 mb-8">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = step.id === currentStep
            const isCompleted = step.id < currentStep

            return (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.title}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStepContent()}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !phoneNumber) ||
                  (currentStep === 2 && (!mcpEndpoint || !mcpApiKey)) ||
                  (currentStep === 3 && testCallStatus !== "success")
                }
                className="gap-2"
              >
                {currentStep === steps.length ? "Complete Setup" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
