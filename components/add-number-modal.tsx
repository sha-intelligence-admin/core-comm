"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "./loading-spinner"
import { CheckCircle, XCircle } from "lucide-react"

interface AddNumberModalProps {
  children: React.ReactNode
}

type ReserveStatus = "success" | "error" | null

export function AddNumberModal({ children }: AddNumberModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reserveResult, setReserveResult] = useState<ReserveStatus>(null)
  const [formData, setFormData] = useState({
    provider: "",
    numberType: "",
    region: "",
    number: "",
    agent: "",
  })

  const handleReserve = async () => {
    setIsLoading(true)
    setReserveResult(null)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const success = Math.random() > 0.2
    setReserveResult(success ? "success" : "error")
    setIsLoading(false)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log("Number payload:", formData)
    setOpen(false)
    setReserveResult(null)
    setFormData({ provider: "", numberType: "", region: "", number: "", agent: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex w-[min(100vw-2rem,440px)] flex-col gap-6 rounded-lg border border-input bg-background p-6 shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="google-headline-small">Add phone number</DialogTitle>
          <DialogDescription className="google-body-medium text-muted-foreground">
            Purchase and assign a new voice number for your CoreComm agents.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider" className="google-label-medium text-muted-foreground">
              Provider
            </Label>
            <Select value={formData.provider} onValueChange={(value) => setFormData((prev) => ({ ...prev, provider: value }))}>
              <SelectTrigger id="provider" className="h-11 rounded-sm border-input">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="telnyx">Telnyx</SelectItem>
                <SelectItem value="plivo">Plivo</SelectItem>
                <SelectItem value="nexmo">Vonage / Nexmo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="numberType" className="google-label-medium text-muted-foreground">
                Number type
              </Label>
              <Select value={formData.numberType} onValueChange={(value) => setFormData((prev) => ({ ...prev, numberType: value }))}>
                <SelectTrigger id="numberType" className="h-11 rounded-sm border-input">
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="toll-free">Toll-free</SelectItem>
                  <SelectItem value="short-code">Short code</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region" className="google-label-medium text-muted-foreground">
                Region
              </Label>
              <Select value={formData.region} onValueChange={(value) => setFormData((prev) => ({ ...prev, region: value }))}>
                <SelectTrigger id="region" className="h-11 rounded-sm border-input">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="eu">European Union</SelectItem>
                  <SelectItem value="ng">Nigeria</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="number" className="google-label-medium text-muted-foreground">
              Desired number or pattern
            </Label>
            <Input
              id="number"
              placeholder="e.g. +1 (415) ***-4452"
              value={formData.number}
              onChange={(event) => setFormData((prev) => ({ ...prev, number: event.target.value }))}
              className="h-11 rounded-sm border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent" className="google-label-medium text-muted-foreground">
              Assign to agent
            </Label>
            <Select value={formData.agent} onValueChange={(value) => setFormData((prev) => ({ ...prev, agent: value }))}>
              <SelectTrigger id="agent" className="h-11 rounded-sm border-input">
                <SelectValue placeholder="Select routing destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="voice-support">Voice Support Bot</SelectItem>
                <SelectItem value="sales-line">Sales Line Agent</SelectItem>
                <SelectItem value="after-hours">After-hours Escalation</SelectItem>
                <SelectItem value="pilot">Pilot Workspace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReserve}
              disabled={isLoading || !formData.provider || !formData.numberType || !formData.region || !formData.number}
              className="flex-1 rounded-sm border-input bg-transparent"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Checking availability...
                </>
              ) : (
                "Check availability"
              )}
            </Button>
            {reserveResult && (
              <div className="flex items-center">
                {reserveResult === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            )}
          </div>

          {reserveResult === "error" && (
            <p className="text-sm text-red-600">Number unavailable. Try another pattern or provider.</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={reserveResult !== "success"} className="rounded-sm">
              Add number
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
