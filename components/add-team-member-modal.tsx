"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { LoadingSpinner } from "./loading-spinner"
import { useTeamMembers } from "@/hooks/use-team-members"
import { Check, Copy, Mail } from "lucide-react"

interface AddTeamMemberModalProps {
  children: React.ReactNode
}

export function AddTeamMemberModal({ children }: AddTeamMemberModalProps) {
  const { createMember } = useTeamMembers()
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState<boolean>(true)
  const [copied, setCopied] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    permissions: {
      analytics: false,
      integrations: false,
      team: false,
      agents: false,
      calls: true,
      messages: true,
      emails: true,
    },
  })

  const togglePermission = (key: keyof typeof formData.permissions) => {
    setFormData((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] },
    }))
  }

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setInviteLink(null)
    setCopied(false)
    setFormData({
      name: "",
      email: "",
      role: "",
      department: "",
      permissions: {
        analytics: false,
        integrations: false,
        team: false,
        agents: false,
        calls: true,
        messages: true,
        emails: true,
      },
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCreating(true)
    setError(null)

    const result = await createMember({
      full_name: formData.name,
      email: formData.email,
      role: formData.role as 'admin' | 'manager' | 'agent' | 'viewer' | 'developer',
      department: formData.department || undefined,
      status: 'invited',
      can_access_analytics: formData.permissions.analytics,
      can_manage_integrations: formData.permissions.integrations,
      can_manage_team: formData.permissions.team,
      can_manage_agents: formData.permissions.agents,
      can_view_calls: formData.permissions.calls,
      can_view_messages: formData.permissions.messages,
      can_view_emails: formData.permissions.emails,
      config: {},
      permissions: {},
    })

    setIsCreating(false)

    if (result.error) {
      setError(result.error)
      return
    }

    // If we got an invite link back, show it
    if (result.inviteLink) {
      setInviteLink(result.inviteLink)
      setEmailSent(result.emailSent !== false)
    } else {
      // Otherwise just close
      handleClose()
    }
  }

  if (inviteLink) {
    return (
      <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="flex w-[min(100vw-2rem,480px)] flex-col gap-6 rounded-lg border border-input bg-background p-6 shadow-2xl">
          <DialogHeader className="space-y-2 text-left">
            
              <Mail className="h-6 w-6 text-primary" />

            <DialogTitle className="google-headline-small">{emailSent ? 'Invitation Sent!' : 'User Added to Team'}</DialogTitle>
            <DialogDescription className="google-body-medium text-muted-foreground">
              {emailSent ? (
                <>We've sent an email to <strong>{formData.email}</strong>. You can also copy the link below to send it manually.</>
              ) : (
                <>This user is already registered. Please copy the link below and send it to them manually.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Invitation Link</Label>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={inviteLink} 
                  className="font-mono text-xs bg-muted/50"
                />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex w-[min(100vw-2rem,480px)] max-h-[85vh] overflow-y-auto flex-col gap-6 rounded-lg border border-input bg-background p-6 shadow-2xl">
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
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-department" className="google-label-medium text-muted-foreground">
              Department (optional)
            </Label>
            <Input
              id="team-department"
              placeholder="Support, Sales, etc."
              value={formData.department}
              onChange={(event) => setFormData((prev) => ({ ...prev, department: event.target.value }))}
              className="h-11 rounded-sm border-input"
            />
          </div>

          <div className="space-y-3">
            <span className="google-label-medium text-muted-foreground">Permissions</span>
            <div className="grid gap-2">
              {[
                { key: "calls", label: "View Calls" },
                { key: "messages", label: "View Messages" },
                { key: "emails", label: "View Emails" },
                { key: "analytics", label: "Access Analytics" },
                { key: "integrations", label: "Manage Integrations" },
                { key: "agents", label: "Manage AI Agents" },
                { key: "team", label: "Manage Team" },
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

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-sm" disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-sm" disabled={isCreating}>
              {isCreating ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Sending...
                </>
              ) : (
                'Send invite'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
