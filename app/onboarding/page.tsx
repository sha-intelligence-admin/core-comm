"use client"

import React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Phone, CheckCircle, Building, Target, Loader2, Server } from "lucide-react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { withCsrfHeaders } from "@/lib/csrf-client"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    companyName: "",
    description: "",
    companySize: "",
    industry: "",

    // Step 2: Phone Setup
    supportVolume: "",
    currentSolution: "",
    phoneNumber: "",
    businessHours: "",
    customHours: "",
    timezone: "",
    phoneNumberSource: "",
    regionPreference: "",

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
  const { toast } = useToast()

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
  const totalSteps = steps.length

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {
    setError(null)
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding - create company
      setLoading(true)
      try {
        const csrfHeaders = await withCsrfHeaders()

        const response = await fetch("/api/onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...csrfHeaders,
          },
          credentials: "include",
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to complete onboarding")
        }

        toast({
          title: "Success!",
          description: `Welcome to CoreComm! Your company "${data.company.name}" has been created.`,
        })

        // Redirect to dashboard
        router.push("/dashboard")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to complete onboarding. Please try again."
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push("/dashboard")
    }
  }

  const progress = (currentStep / totalSteps) * 100

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

  const requiresPhoneNumber =
    formData.phoneNumberSource === "forward-existing" || formData.phoneNumberSource === "twilio-user-managed"
  const requiresRegionPreference = formData.phoneNumberSource === "twilio-new"

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto space-y-6 pt-8">
        <div className="text-center">
          <h1 className="google-headline-medium">Welcome to CoreComm</h1>
          <p className="text-muted-foreground google-body-medium">
            Let&apos;s set up your AI customer support platform in just a few steps
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="rounded-sm transition-all duration-300 hover:border-primary/50 border-input">
          <CardHeader className="transition-colors duration-300 rounded-t-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                {React.createElement(steps[currentStep - 1].icon, {
                  className: "h-6 w-6 text-primary",
                })}
              </div>
              <div>
                <CardTitle className="google-headline-small">{steps[currentStep - 1].title}</CardTitle>
                <CardDescription className="google-body-medium">{steps[currentStep - 1].description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-500 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-foreground font-medium">
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    required
                    // disabled={loading}
                    className="border-input focus:border-primary focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground font-medium">
                    Company Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Company Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                    // disabled={loading}
                    className="border-input focus:border-primary focus:ring-primary/50"
                  />
                </div>
                {/* Additional company questions can be re-added here */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySize" className="text-foreground font-medium">
                      Company Size
                    </Label>
                    <Select
                      value={formData.companySize}
                      onValueChange={(value) => handleInputChange("companySize", value)}
                    >
                      <SelectTrigger className="rounded-lg border-input focus:border-primary">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">1-10 employees (Small)</SelectItem>
                        <SelectItem value="medium">11-50 employees (Medium)</SelectItem>
                        <SelectItem value="large">51+ employees (Large)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-foreground font-medium">
                      Industry
                    </Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                      <SelectTrigger className="rounded-lg border-input focus:border-primary">
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
                {/* <div className="space-y-2">
                  <Label htmlFor="supportVolume" className="text-foreground font-medium">
                    Current Support Volume
                  </Label>
                  <Select
                    value={formData.supportVolume}
                    onValueChange={(value) => handleInputChange("supportVolume", value)}
                  >
                    <SelectTrigger className="rounded-lg border-input focus:border-primary">
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
                  <Label htmlFor="currentSolution" className="text-foreground font-medium">
                    Current Solution
                  </Label>
                  <Textarea
                    id="currentSolution"
                    placeholder="Tell us about your current customer support setup..."
                    value={formData.currentSolution}
                    onChange={(e) => handleInputChange("currentSolution", e.target.value)}
                    className="rounded-lg border-input focus:border-primary focus:ring-primary/50"
                  />
                </div> */}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supportVolume" className="text-foreground font-medium">
                    Current Support Volume
                  </Label>
                  <Select
                    value={formData.supportVolume}
                    onValueChange={(value) => handleInputChange("supportVolume", value)}
                  >
                    <SelectTrigger className="rounded-lg border-input focus:border-primary">
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
                  <Label htmlFor="currentSolution" className="text-foreground font-medium">
                    Current Solution
                  </Label>
                  <Textarea
                    id="currentSolution"
                    placeholder="Tell us about your current customer support setup..."
                    value={formData.currentSolution}
                    onChange={(e) => handleInputChange("currentSolution", e.target.value)}
                    className="rounded-lg border-input focus:border-primary focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumberSource" className="text-foreground font-medium">
                    Phone Number Source
                  </Label>
                  <Select
                    value={formData.phoneNumberSource}
                    onValueChange={(value) => handleInputChange("phoneNumberSource", value)}
                  >
                    <SelectTrigger className="rounded-lg border-input focus:border-primary">
                      <SelectValue placeholder="How should we provision it?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio-new">Purchase new via Twilio</SelectItem>
                      <SelectItem value="forward-existing">Forward from another line</SelectItem>
                      <SelectItem value="twilio-user-managed">I'll configure Twilio myself</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {requiresRegionPreference && (
                  <div className="space-y-2">
                    <Label htmlFor="regionPreference" className="text-foreground font-medium">
                      Region Preference
                    </Label>
                    <Select
                      value={formData.regionPreference}
                      onValueChange={(value) => handleInputChange("regionPreference", value)}
                    >
                      <SelectTrigger className="rounded-lg border-input focus:border-primary">
                        <SelectValue placeholder="Where should the number originate?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="eu">European Union</SelectItem>
                        <SelectItem value="apac">Asia Pacific</SelectItem>
                        <SelectItem value="latam">Latin America</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">We&apos;ll search Twilio&apos;s inventory for numbers closest to this region.</p>
                  </div>
                )}

                {requiresPhoneNumber && (
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-foreground font-medium">
                      {formData.phoneNumberSource === "twilio-user-managed"
                        ? "Twilio Number You'll Configure"
                        : "Existing Number to Forward"}
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="e.g., +1 (555) 123-4567"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className="rounded-lg border-input focus:border-primary focus:ring-primary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.phoneNumberSource === "twilio-user-managed"
                        ? "We’ll store this number and send you webhook instructions to configure inside your own Twilio account."
                        : "We&apos;ll configure Twilio to forward calls from this number into CoreComm."}
                    </p>
                  </div>
                )}

                {formData.phoneNumberSource === "twilio-user-managed" && (
                  <div className="rounded-lg border border-dashed border-primary/40 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-primary mb-2">Manual Twilio setup</p>
                    <p>
                      After onboarding you&apos;ll receive a checklist to point your Twilio number&apos;s Voice &amp; SMS webhooks to CoreComm.
                      This option is ideal if the number lives in a customer-owned Twilio project.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessHours" className="text-foreground font-medium">
                      Business Hours
                    </Label>
                    <Select
                      value={formData.businessHours}
                      onValueChange={(value) => handleInputChange("businessHours", value)}
                    >
                      <SelectTrigger className="rounded-lg border-input focus:border-primary">
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
                  {/* {formData.businessHours === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="customHours" className="text-foreground font-medium">
                        Specify Custom Hours
                      </Label>
                      <Input
                        type="text"
                        id="customHours"
                        value={formData.customHours}
                        onChange={(e) => handleInputChange("customHours", e.target.value)}
                        placeholder="e.g., Mon-Fri, 10am-6pm"
                        className="rounded-lg border-input focus:border-primary"
                      />
                    </div>
                  )} */}
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-foreground font-medium">
                      Timezone
                    </Label>
                    <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                      <SelectTrigger className="rounded-lg border-input focus:border-primary">
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
                <div className="rounded-lg bg-primary/5 p-4 border border-input">
                  <h4 className="font-medium mb-2 text-primary">Phone Setup Benefits</h4>
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
                  <Label htmlFor="integrationName" className="text-foreground font-medium">
                    Integration Name
                  </Label>
                  <Input
                    id="integrationName"
                    placeholder="Knowledge Base API"
                    value={formData.integrationName}
                    onChange={(e) => handleInputChange("integrationName", e.target.value)}
                    className="rounded-lg border-input focus:border-primary focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mcpEndpoint" className="text-foreground font-medium">
                    Endpoint URL
                  </Label>
                  <Input
                    id="mcpEndpoint"
                    type="url"
                    placeholder="https://api.yourcompany.com/knowledge"
                    value={formData.mcpEndpoint}
                    onChange={(e) => handleInputChange("mcpEndpoint", e.target.value)}
                    className="rounded-lg border-input focus:border-primary focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-foreground font-medium">
                    API Key
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange("apiKey", e.target.value)}
                    className="rounded-lg border-input focus:border-primary focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="knowledgeBase" className="text-foreground font-medium">
                    Knowledge Base Description
                  </Label>
                  <Textarea
                    id="knowledgeBase"
                    placeholder="Describe your knowledge base content and structure..."
                    value={formData.knowledgeBase}
                    onChange={(e) => handleInputChange("knowledgeBase", e.target.value)}
                    className="rounded-lg border-input focus:border-primary focus:ring-primary/50"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-lg border-brand/30 hover:bg-primary/10 hover:text-primary bg-transparent"
                >
                  Test Connection
                </Button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-foreground font-medium">Primary Goals (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {goalOptions.map((goal) => (
                      <Button
                        key={goal}
                        type="button"
                        variant={formData.primaryGoals.includes(goal) ? "default" : "outline"}
                        className={`rounded-lg text-left justify-start h-auto p-3 ${formData.primaryGoals.includes(goal)
                          ? "bg-primary text-white"
                          : "border-brand/30 hover:bg-primary/10 hover:text-primary bg-transparent"
                          }`}
                        onClick={() => toggleGoal(goal)}
                      >
                        {goal}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedVolume" className="text-foreground font-medium">
                    Expected Call Volume
                  </Label>
                  <Select
                    value={formData.expectedVolume}
                    onValueChange={(value) => handleInputChange("expectedVolume", value)}
                  >
                    <SelectTrigger className="rounded-lg border-input focus:border-primary">
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
                    <h3 className="text-lg font-semibold text-primary">Ready to Launch!</h3>
                    <p className="text-muted-foreground">
                      Your CoreComm platform is configured and ready to handle customer calls
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={loading}
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  Back
                </Button>
              )}
              <Button 
                onClick={handleNext} 
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white ml-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Company...
                  </>
                ) : (
                  currentStep === totalSteps ? "Complete Setup" : "Continue"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
