"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePhoneNumbers, type PhoneNumber } from "@/hooks/use-phone-numbers"
import { useAssistants } from "@/hooks/use-assistants"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Phone, Hash, Edit, Trash2, Loader2, Power } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PhoneNumbersPage() {
  const { phoneNumbers, loading, error, updatePhoneNumber, deletePhoneNumber } = usePhoneNumbers()
  const { assistants } = useAssistants()
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState<string | undefined>(undefined)

  const editNumber = phoneNumbers.find((p) => p.id === editId)

  const handleUpdate = async () => {
    if (!editId) return

    setUpdating(true)
    try {
      const result = await updatePhoneNumber(editId, {
        assigned_to: selectedAssistant ?? undefined,
      })

      if (result && "error" in result) {
        throw new Error(result.error)
      }

      setEditId(null)
      setSelectedAssistant(undefined)
    } catch (err) {
      console.error('Failed to update phone number:', err)
    } finally {
      setUpdating(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: PhoneNumber['status']) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const result = await updatePhoneNumber(id, { status: nextStatus })

      if (result && "error" in result) {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('Failed to toggle status:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      const result = await deletePhoneNumber(deleteId)
      if (result && "error" in result) {
        throw new Error(result.error)
      }
      setDeleteId(null)
    } catch (err) {
      console.error('Failed to delete phone number:', err)
    } finally {
      setDeleting(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-brand/10 to-transparent p-6 rounded-2xl border border-brand/20">
          <h1 className="text-3xl font-bold tracking-tight text-brand">Phone Numbers</h1>
          <p className="text-muted-foreground">Manage your voice-enabled phone numbers</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load phone numbers: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand/10 to-transparent p-6 rounded-2xl border border-brand/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand">Phone Numbers</h1>
            <p className="text-muted-foreground">Manage your voice-enabled phone numbers</p>
          </div>
          <Button
            className="rounded-xl bg-brand hover:bg-brand/90 hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => alert("Phone number provisioning coming soon! This requires Vapi API integration.")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Provision Number
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : phoneNumbers.length === 0 ? (
        <Card className="rounded-2xl border-brand/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Hash className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No phone numbers yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              Provision a phone number to start receiving calls through your voice agents
            </p>
            <Button
              className="rounded-xl bg-brand hover:bg-brand/90"
              onClick={() => alert("Phone number provisioning coming soon! This requires Vapi API integration.")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Provision Your First Number
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {phoneNumbers.map((phoneNumber: PhoneNumber) => {
            const assignedAssistant = assistants.find((a: any) => a.id === phoneNumber.assigned_to)
            const isActive = phoneNumber.status === 'active'

            return (
              <Card
                key={phoneNumber.id}
                className="rounded-2xl border-brand/20 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group"
              >
                <CardHeader className="bg-gradient-to-r from-brand/5 to-transparent group-hover:from-brand/10 transition-all duration-300 rounded-t-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Phone className="h-6 w-6 text-brand" />
                      </div>
                      <div>
                        <CardTitle className="text-brand group-hover:text-brand/80 transition-colors duration-200 font-mono">
                          {phoneNumber.phone_number}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {phoneNumber.provider} • {phoneNumber.country_code}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className={isActive ? "bg-green-500" : ""}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="p-3 rounded-lg bg-brand/5 border border-brand/10">
                      <p className="text-xs text-muted-foreground mb-1">Assigned Assistant</p>
                      <p className="font-medium text-brand">
                        {assignedAssistant?.name || "Not assigned"}
                      </p>
                    </div>
                    {assignedAssistant?.vapi_assistant_id && (
                      <div className="p-3 rounded-lg bg-brand/5 border border-brand/10">
                        <p className="text-xs text-muted-foreground mb-1">SIP URI (For Call Forwarding)</p>
                        <p className="font-mono text-xs text-brand break-all select-all">
                          sip:{assignedAssistant.vapi_assistant_id}@sip.vapi.ai
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-brand/5 transition-colors duration-200">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">
                        {new Date(phoneNumber.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl hover:bg-brand/10 hover:text-brand hover:border-brand transition-all duration-200"
                      onClick={() => {
                        setEditId(phoneNumber.id)
                        setSelectedAssistant(phoneNumber.assigned_to || undefined)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`rounded-xl transition-all duration-200 ${
                        isActive
                          ? "hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-600"
                          : "hover:bg-green-50 hover:text-green-600 hover:border-green-600"
                      }`}
                      onClick={() => handleToggleActive(phoneNumber.id, phoneNumber.status)}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all duration-200"
                      onClick={() => setDeleteId(phoneNumber.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Assistant Dialog */}
      <Dialog
        open={!!editId}
        onOpenChange={(open) => {
          if (!open) {
            setEditId(null)
            setSelectedAssistant(undefined)
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Assign Voice Assistant</DialogTitle>
            <DialogDescription>
              Choose which voice assistant should handle calls to {editNumber?.phone_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Select
                value={selectedAssistant ?? "none"}
                onValueChange={(value) =>
                  setSelectedAssistant(value === "none" ? undefined : value)
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select an assistant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No assistant</SelectItem>
                  {assistants.map((assistant: any) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      {assistant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditId(null)}
              disabled={updating}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updating}
              className="rounded-xl bg-brand hover:bg-brand/90"
            >
              {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {updating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Phone Number?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the phone number
              and it will no longer receive calls.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
