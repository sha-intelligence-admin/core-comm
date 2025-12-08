"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "./loading-spinner"
import { PhoneNumberProvider, ProvisionPhoneNumberPayload, usePhoneNumbers } from "@/hooks/use-phone-numbers"

interface AddNumberModalProps {
  children: React.ReactNode
  assistants?: Array<{ id: string; name: string }>
}

const normalizeToE164 = (value: string) => {
  if (!value) return ""
  const digits = value.replace(/[^\d+]/g, "")
  if (!digits) return ""
  return digits.startsWith("+") ? digits : `+${digits}`
}

const INITIAL_FORM = {
  provider: "twilio" as PhoneNumberProvider,
  areaCode: "",
  number: "",
  assistantId: "",
  fallbackNumber: "",
}

export function AddNumberModal({ children, assistants = [] }: AddNumberModalProps) {
  const { createPhoneNumber } = usePhoneNumbers()
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [formData, setFormData] = useState(INITIAL_FORM)

  const isByo = formData.provider === "byo"

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage("")

    try {
      const payload: ProvisionPhoneNumberPayload = {
        provider: formData.provider,
      }

      if (formData.assistantId) {
        payload.assistantId = formData.assistantId
      }

      if (isByo) {
        const normalized = normalizeToE164(formData.number)
        if (!normalized) {
          throw new Error("Please provide a valid E.164 formatted number.")
        }
        payload.number = normalized
      } else {
        if (!/^\d{3}$/.test(formData.areaCode)) {
          throw new Error("Area code must be exactly 3 digits")
        }
        payload.areaCode = formData.areaCode
      }

      if (formData.fallbackNumber) {
        payload.fallbackNumber = normalizeToE164(formData.fallbackNumber)
      }

      const result = await createPhoneNumber(payload)

      if (result.error) {
        throw new Error(result.error)
      }

      setOpen(false)
      setFormData(INITIAL_FORM)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to provision phone number")
    } finally {
      setIsSaving(false)
    }
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
            <Select
              value={formData.provider}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, provider: value as PhoneNumberProvider }))}
            >
              <SelectTrigger id="provider" className="h-11 rounded-sm border-input">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="telnyx">Telnyx</SelectItem>
                <SelectItem value="vonage">Vonage</SelectItem>
                <SelectItem value="byo">Bring your own</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isByo ? (
            <div className="space-y-2">
              <Label htmlFor="number" className="google-label-medium text-muted-foreground">
                Existing E.164 number
              </Label>
              <Input
                id="number"
                placeholder="e.g. +14155551212"
                value={formData.number}
                onChange={(event) => setFormData((prev) => ({ ...prev, number: event.target.value }))}
                className="h-11 rounded-sm border-input"
                required
              />
              <p className="text-xs text-muted-foreground">We will register this number with Vapi and keep the existing carrier (Twilio, PSTN, etc.).</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="areaCode" className="google-label-medium text-muted-foreground">
                Preferred area code
              </Label>
              <Input
                id="areaCode"
                placeholder="415"
                value={formData.areaCode}
                onChange={(event) => setFormData((prev) => ({ ...prev, areaCode: event.target.value }))}
                className="h-11 rounded-sm border-input"
                maxLength={3}
                required
              />
              <p className="text-xs text-muted-foreground">We ask Vapi/Twilio to purchase the closest available number.</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="assistant" className="google-label-medium text-muted-foreground">
              Default assistant
            </Label>
            <Select
              value={formData.assistantId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, assistantId: value === "none" ? "" : value }))}
            >
              <SelectTrigger id="assistant" className="h-11 rounded-sm border-input">
                <SelectValue placeholder="Route to a voice agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No assistant</SelectItem>
                {assistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fallback" className="google-label-medium text-muted-foreground">
              Fallback / failover number (optional)
            </Label>
            <Input
              id="fallback"
              placeholder="e.g. +14155559876"
              value={formData.fallbackNumber}
              onChange={(event) => setFormData((prev) => ({ ...prev, fallbackNumber: event.target.value }))}
              className="h-11 rounded-sm border-input"
            />
            <p className="text-xs text-muted-foreground">We will forward calls here if the assistant or Vapi is unavailable.</p>
          </div>

          {errorMessage && (
            <div className="rounded-sm bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-sm"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-sm"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Provisioning...
                </>
              ) : (
                "Provision number"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
