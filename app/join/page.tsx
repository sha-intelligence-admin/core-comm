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

export default function JoinPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        // Step 1: Company Info
        companyId: "",
        memberKey: "",
    })
    
    const router = useRouter()

    const steps = [
        {
            id: 1,
            title: "Join Company",
            description: "Enter your company credentials to continue",
            icon: Building,
        }
    ]

    const handleInputChange = (field: string, value: string | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleNext = () => {
        router.push("/dashboard")
    }

    const handleBack = () => {
        router.back()
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-3xl space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-brand">Welcome to CoreComm</h1>
                    <p className="text-muted-foreground">Join Your Company</p>
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
                                <div className="space-y-2">
                                    <Label htmlFor="companyId" className="text-brand/80 font-medium">
                                        Company ID
                                    </Label>
                                    <Input
                                        id="companyId"
                                        name="companyId"
                                        placeholder="Company ID"
                                        value={formData.companyId}
                                        onChange={(e) => handleInputChange("companyId", e.target.value)}
                                        required
                                        // disabled={loading}
                                        className="border-brand/20 focus:border-brand focus:ring-brand/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="memberKey" className="text-brand/80 font-medium">
                                        Member Key
                                    </Label>
                                    <Input
                                        id="memberKey"
                                        name="memberKey"
                                        placeholder="Member Key"
                                        value={formData.memberKey}
                                        onChange={(e) => handleInputChange("memberKey", e.target.value)}
                                        required
                                        // disabled={loading}
                                        className="border-brand/20 focus:border-brand focus:ring-brand/20"
                                    />
                                </div>

                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="rounded-xl hover:bg-brand/10 hover:text-brand"
                            >
                                Back
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
