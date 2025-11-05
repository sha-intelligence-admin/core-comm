"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface AddTeamMemberModalProps {
  children: React.ReactNode
}

export function AddTeamMemberModal({ children }: AddTeamMemberModalProps) {
  const [open, setOpen] = useState(false)
  const [regions, setRegions] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    permissions: {
      voice: false,
      messaging: false,
      analytics: true,
      billing: false,
    },
  })

  const toggleRegion = (value: string) => {
    setRegions((prev) => (prev.includes(value) ? prev.filter((region) => region !== value) : [...prev, value]))
  }

  const togglePermission = (key: keyof typeof formData.permissions) => {
    setFormData((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] },
    }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log("Team member payload:", { ...formData, regions })
    setOpen(false)
    setRegions([])
    setFormData({
      name: "",
      email: "",
      role: "",
      permissions: { voice: false, messaging: false, analytics: true, billing: false },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex w-[min(100vw-2rem,480px)] flex-col gap-6 rounded-lg border border-input bg-background p-6 shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="google-headline-small">Add team member</DialogTitle>
          <DialogDescription className="google-body-medium text-muted-foreground">
            Invite a teammate and assign the right permissions before they join.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name" className="google-label-medium text-muted-foreground">
              Full name
            </Label>
            <Input
              id="team-name"
              placeholder="Ada Lovelace"
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              className="h-11 rounded-sm border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-email" className="google-label-medium text-muted-foreground">
              Work email
            </Label>
            <Input
              id="team-email"
              type="email"
              placeholder="ada@corecomm.io"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              className="h-11 rounded-sm border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-role" className="google-label-medium text-muted-foreground">
              Role
            </Label>
            <Select value={formData.role} onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}>
              <SelectTrigger id="team-role" className="h-11 rounded-sm border-input">
                <SelectValue placeholder="Choose role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="support">Support Agent</SelectItem>
                <SelectItem value="sales">Sales Agent</SelectItem>
                <SelectItem value="observer">Observer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <span className="google-label-medium text-muted-foreground">Access regions</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { value: "na", label: "North America" },
                { value: "emea", label: "EMEA" },
                { value: "latam", label: "LATAM" },
                { value: "apac", label: "APAC" },
              ].map((region) => (
                <label key={region.value} className="flex items-center gap-2 rounded-sm border border-input bg-muted/40 p-2 text-sm">
                  <Checkbox
                    checked={regions.includes(region.value)}
                    onCheckedChange={() => toggleRegion(region.value)}
                  />
                  <span>{region.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="google-label-medium text-muted-foreground">Feature permissions</span>
            <div className="grid gap-2">
              {[
                { key: "voice", label: "Voice & Call Routing" },
                { key: "messaging", label: "Messaging Inbox" },
                { key: "analytics", label: "Analytics & Reporting" },
                { key: "billing", label: "Billing & Usage" },
              ].map((permission) => (
                <label key={permission.key} className="flex items-center justify-between rounded-sm border border-input bg-muted/40 px-3 py-2 text-sm">
                  <span>{permission.label}</span>
                  <Checkbox
                    checked={formData.permissions[permission.key as keyof typeof formData.permissions]}
                    onCheckedChange={() => togglePermission(permission.key as keyof typeof formData.permissions)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-sm">
              Cancel
            </Button>
            <Button type="submit" className="rounded-sm">
              Send invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
