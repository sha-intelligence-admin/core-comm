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

interface AddChannelModalProps {
  children: React.ReactNode
}

type TestResult = "success" | "error" | null

export function AddChannelModal({ children }: AddChannelModalProps) {
  const [open, setOpen] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult>(null)
  const [formData, setFormData] = useState({
    platform: "",
    channelName: "",
    webhookUrl: "",
    accessToken: "",
  })

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const success = Math.random() > 0.25
    setTestResult(success ? "success" : "error")
    setIsTesting(false)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log("Channel payload:", formData)
    setOpen(false)
    setTestResult(null)
    setFormData({ platform: "", channelName: "", webhookUrl: "", accessToken: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex w-[min(100vw-2rem,460px)] flex-col gap-6 rounded-lg border border-input bg-background p-6 shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="google-headline-small">Connect messaging channel</DialogTitle>
          <DialogDescription className="google-body-medium text-muted-foreground">
            Authenticate a new messaging endpoint and sync it to your unified inbox.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-platform" className="google-label-medium text-muted-foreground">
              Platform
            </Label>
            <Select value={formData.platform} onValueChange={(value) => setFormData((prev) => ({ ...prev, platform: value }))}>
              <SelectTrigger id="channel-platform" className="h-11 rounded-sm border-input">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp Business API</SelectItem>
                <SelectItem value="telegram">Telegram Bot</SelectItem>
                <SelectItem value="discord">Discord Server</SelectItem>
                <SelectItem value="slack">Slack Workspace</SelectItem>
                <SelectItem value="webchat">Website Chat Widget</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel-name" className="google-label-medium text-muted-foreground">
              Channel name
            </Label>
            <Input
              id="channel-name"
              placeholder="Support Bot (WhatsApp)"
              value={formData.channelName}
              onChange={(event) => setFormData((prev) => ({ ...prev, channelName: event.target.value }))}
              className="h-11 rounded-sm border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook" className="google-label-medium text-muted-foreground">
              Webhook URL
            </Label>
            <Input
              id="webhook"
              type="url"
              placeholder="https://api.corecomm.ai/messaging/webhook"
              value={formData.webhookUrl}
              onChange={(event) => setFormData((prev) => ({ ...prev, webhookUrl: event.target.value }))}
              className="h-11 rounded-sm border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access-token" className="google-label-medium text-muted-foreground">
              Access token
            </Label>
            <Input
              id="access-token"
              type="password"
              placeholder="Bearer token or API secret"
              value={formData.accessToken}
              onChange={(event) => setFormData((prev) => ({ ...prev, accessToken: event.target.value }))}
              className="h-11 rounded-sm border-input"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting || !formData.platform || !formData.webhookUrl || !formData.accessToken}
              className="flex-1 rounded-sm border-input bg-transparent"
            >
              {isTesting ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Testing connection...
                </>
              ) : (
                "Test connection"
              )}
            </Button>
            {testResult && (
              <div className="flex items-center">
                {testResult === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            )}
          </div>

          {testResult === "error" && (
            <p className="text-sm text-red-600">Authentication failed. Check your credentials and try again.</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={testResult !== "success"} className="rounded-sm">
              Connect channel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
