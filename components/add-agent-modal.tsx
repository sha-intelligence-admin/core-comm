"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface AddAgentModalProps {
  children: React.ReactNode
}

export function AddAgentModal({ children }: AddAgentModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    channel: "",
    goal: "",
    knowledgeBase: "",
    handoff: "",
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log("Agent payload:", formData)
    setOpen(false)
    setFormData({ name: "", channel: "", goal: "", knowledgeBase: "", handoff: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex w-[min(100vw-2rem,480px)] flex-col gap-6 rounded-lg border border-input bg-background p-6 shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="google-headline-small">Create AI agent</DialogTitle>
          <DialogDescription className="google-body-medium text-muted-foreground">
            Configure a new automation agent with routing and handoff preferences.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name" className="google-label-medium text-muted-foreground">
              Agent name
            </Label>
            <Input
              id="agent-name"
              placeholder="Voice Support Bot"
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              className="h-11 rounded-sm border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-channel" className="google-label-medium text-muted-foreground">
              Primary channel
            </Label>
            <Select value={formData.channel} onValueChange={(value) => setFormData((prev) => ({ ...prev, channel: value }))}>
              <SelectTrigger id="agent-channel" className="h-11 rounded-sm border-input">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="voice">Voice (Twilio/SIP)</SelectItem>
                <SelectItem value="messaging">Messaging (WhatsApp/Telegram)</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="workspace">Internal Workspace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-goal" className="google-label-medium text-muted-foreground">
              Agent goal
            </Label>
            <Textarea
              id="agent-goal"
              placeholder="Handle inbound support calls, authenticate customers, and escalate complex cases to humans."
              value={formData.goal}
              onChange={(event) => setFormData((prev) => ({ ...prev, goal: event.target.value }))}
              className="min-h-[96px] rounded-sm border-input"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agent-knowledge-base" className="google-label-medium text-muted-foreground">
                Knowledge source
              </Label>
              <Select value={formData.knowledgeBase} onValueChange={(value) => setFormData((prev) => ({ ...prev, knowledgeBase: value }))}>
                <SelectTrigger id="agent-knowledge-base" className="h-11 rounded-sm border-input">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support-faq">Support FAQ Workspace</SelectItem>
                  <SelectItem value="retail">Retail Playbooks</SelectItem>
                  <SelectItem value="banking">Banking Knowledge Graph</SelectItem>
                  <SelectItem value="custom">Custom Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-handoff" className="google-label-medium text-muted-foreground">
                Human handoff path
              </Label>
              <Select value={formData.handoff} onValueChange={(value) => setFormData((prev) => ({ ...prev, handoff: value }))}>
                <SelectTrigger id="agent-handoff" className="h-11 rounded-sm border-input">
                  <SelectValue placeholder="Choose escalation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support-queue">Support queue (voice)</SelectItem>
                  <SelectItem value="messaging-team">Messaging team inbox</SelectItem>
                  <SelectItem value="sla">VIP SLA escalation</SelectItem>
                  <SelectItem value="ops">Operations on-call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-sm">
              Cancel
            </Button>
            <Button type="submit" className="rounded-sm">
              Create agent
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
