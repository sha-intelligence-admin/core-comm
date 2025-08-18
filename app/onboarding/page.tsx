"use client"

import React from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Server, CheckCircle, Building, Target } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    companySize: "",
    industry: "",
    supportVolume: "",
    currentSolution: "",

    // Step 2: Phone Setup
    phoneNumber: "",
    businessHours: "",
    timezone: "",

    // Step 3: Integration Setup
    integrationName: "",
    mcpEndpoint: "",
    apiKey: "",
    knowledgeBase: "",

    // Step 4: Goals
    primaryGoals: [] as string[],
    expectedVolume: "",
    successMetrics: "",
  })
  const router = useRouter()

  const steps = [
    {
      id: 1,
      title: "Company Information",
      description: "Tell us about your business",
      icon: Building,
    },
    {
      id: 2,
      title: "Phone Configuration",
      description: "Set up your customer support line",
      icon: Phone,
    },
    {
      id: 3,
      title: "Knowledge Integration",
      description: "Connect your knowledge sources",
      icon: Server,
    },
    {
      id: 4,
      title: "Goals & Preferences",
      description: "Define your success metrics",
      icon: Target,
    },
  ]

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding
      router.push("/dashboard")
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  const progress = (currentStep / 4) * 100

  const toggleGoal = (goal: string) => {
    const currentGoals = formData.primaryGoals
    const updatedGoals = currentGoals.includes(goal) ? currentGoals.filter((g) => g !== goal) : [...currentGoals, goal]
    handleInputChange("primaryGoals", updatedGoals)
  }

  const goalOptions = [
    "Reduce response time",
    "Increase customer satisfaction",
    "Lower support costs",
    "Handle more volume",
    "Improve first-call resolution",
    "24/7 availability",
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-brand">Welcome to CoreComm</h1>
          <p className="text-muted-foreground">Let's set up your AI customer support platform in just a few steps</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of 4</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="rounded-2xl border-brand/20">
          <CardHeader className="text-center bg-gradient-to-r from-brand/5 to-transparent rounded-t-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
              {React.createElement(steps[currentStep - 1].icon, {
                className: "h-8 w-8 text-brand",
              })}
            </div>
            <CardTitle className="text-2xl text-brand">{steps[currentStep - 1].title}</CardTitle>
            <CardDescription className="text-base">{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySize" className="text-brand/80 font-medium">
                      Company Size
                    </Label>
                    <Select
                      value={formData.companySize}
                      onValueChange={(value) => handleInputChange("companySize", value)}
                    >
                      <SelectTrigger className="rounded-xl border-brand/20 focus:border-brand">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-brand/80 font-medium">
                      Industry
                    </Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                      <SelectTrigger className="rounded-xl border-brand/20 focus:border-brand">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportVolume" className="text-brand/80 font-medium">
                    Current Support Volume
                  </Label>
                  <Select
                    value={formData.supportVolume}
                    onValueChange={(value) => handleInputChange("supportVolume", value)}
                  >
                    <SelectTrigger className="rounded-xl border-brand/20 focus:border-brand">
                      <SelectValue placeholder="How many support requests per month?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-100">0-100 requests</SelectItem>
                      <SelectItem value="101-500">101-500 requests</SelectItem>
                      <SelectItem value="501-2000">501-2000 requests</SelectItem>
                      <SelectItem value="2000+">2000+ requests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentSolution" className="text-brand/80 font-medium">
                    Current Solution
                  </Label>
                  <Textarea
                    id="currentSolution"
                    placeholder="Tell us about your current customer support setup..."
                    value={formData.currentSolution}
                    onChange={(e) => handleInputChange("currentSolution", e.target.value)}
                    className="rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-brand/80 font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessHours" className="text-brand/80 font-medium">
                      Business Hours
                    </Label>
                    <Select
                      value={formData.businessHours}
                      onValueChange={(value) => handleInputChange("businessHours", value)}
                    >
                      <SelectTrigger className="rounded-xl border-brand/20 focus:border-brand">
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24/7">24/7</SelectItem>
                        <SelectItem value="business">Business Hours (9-5)</SelectItem>
                        <SelectItem value="extended">Extended Hours (8-8)</SelectItem>
                        <SelectItem value="custom">Custom Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-brand/80 font-medium">
                      Timezone
                    </Label>
                    <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                      <SelectTrigger className="rounded-xl border-brand/20 focus:border-brand">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                        <SelectItem value="CST">Central Time (CST)</SelectItem>
                        <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                        <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="rounded-xl bg-brand/5 p-4 border border-brand/20">
                  <h4 className="font-medium mb-2 text-brand">Phone Setup Benefits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Instant AI-powered call handling</li>
                    <li>• Automatic call routing and escalation</li>
                    <li>• Real-time transcription and analysis</li>
                    <li>• Integration with your existing systems</li>
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="integrationName" className="text-brand/80 font-medium">
                    Integration Name
                  </Label>
                  <Input
                    id="integrationName"
                    placeholder="Knowledge Base API"
                    value={formData.integrationName}
                    onChange={(e) => handleInputChange("integrationName", e.target.value)}
                    className="rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mcpEndpoint" className="text-brand/80 font-medium">
                    Endpoint URL
                  </Label>
                  <Input
                    id="mcpEndpoint"
                    type="url"
                    placeholder="https://api.yourcompany.com/knowledge"
                    value={formData.mcpEndpoint}
                    onChange={(e) => handleInputChange("mcpEndpoint", e.target.value)}
                    className="rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-brand/80 font-medium">
                    API Key
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange("apiKey", e.target.value)}
                    className="rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="knowledgeBase" className="text-brand/80 font-medium">
                    Knowledge Base Description
                  </Label>
                  <Textarea
                    id="knowledgeBase"
                    placeholder="Describe your knowledge base content and structure..."
                    value={formData.knowledgeBase}
                    onChange={(e) => handleInputChange("knowledgeBase", e.target.value)}
                    className="rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-brand/30 hover:bg-brand/10 hover:text-brand bg-transparent"
                >
                  Test Connection
                </Button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-brand/80 font-medium">Primary Goals (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {goalOptions.map((goal) => (
                      <Button
                        key={goal}
                        type="button"
                        variant={formData.primaryGoals.includes(goal) ? "default" : "outline"}
                        className={`rounded-xl text-left justify-start h-auto p-3 ${
                          formData.primaryGoals.includes(goal)
                            ? "bg-brand text-white"
                            : "border-brand/30 hover:bg-brand/10 hover:text-brand bg-transparent"
                        }`}
                        onClick={() => toggleGoal(goal)}
                      >
                        {goal}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedVolume" className="text-brand/80 font-medium">
                    Expected Call Volume
                  </Label>
                  <Select
                    value={formData.expectedVolume}
                    onValueChange={(value) => handleInputChange("expectedVolume", value)}
                  >
                    <SelectTrigger className="rounded-xl border-brand/20 focus:border-brand">
                      <SelectValue placeholder="Expected calls per month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-500">0-500 calls</SelectItem>
                      <SelectItem value="501-2000">501-2000 calls</SelectItem>
                      <SelectItem value="2001-5000">2001-5000 calls</SelectItem>
                      <SelectItem value="5000+">5000+ calls</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-brand">Ready to Launch!</h3>
                    <p className="text-muted-foreground">
                      Your CoreComm platform is configured and ready to handle customer calls
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={handleSkip} className="rounded-xl hover:bg-brand/10 hover:text-brand">
                Skip Setup
              </Button>
              <Button onClick={handleNext} className="rounded-xl bg-brand hover:bg-brand/90">
                {currentStep === 4 ? "Complete Setup" : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
