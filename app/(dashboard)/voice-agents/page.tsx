"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAssistants } from "@/hooks/use-assistants"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Bot, Mic, Edit, Trash2, Loader2 } from "lucide-react"
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

export default function VoiceAgentsPage() {
  const { assistants, isLoading, error, deleteAssistant } = useAssistants()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      await deleteAssistant(deleteId)
      setDeleteId(null)
    } catch (err) {
      console.error('Failed to delete assistant:', err)
    } finally {
      setDeleting(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-brand/10 to-transparent p-6 rounded-2xl border border-brand/20">
          <h1 className="text-3xl font-bold tracking-tight text-brand">Voice Agents</h1>
          <p className="text-muted-foreground">Manage your AI-powered voice assistants</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load voice agents: {error.message}
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
            <h1 className="text-3xl font-bold tracking-tight text-brand">Voice Agents</h1>
            <p className="text-muted-foreground">Manage your AI-powered voice assistants</p>
          </div>
          <Button
            className="rounded-xl bg-brand hover:bg-brand/90 hover:scale-105 transition-all duration-200 shadow-lg"
            disabled
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Assistant
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : assistants.length === 0 ? (
        <Card className="rounded-2xl border-brand/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No voice agents yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              Create your first AI voice assistant to start handling customer calls automatically
            </p>
            <Button
              className="rounded-xl bg-brand hover:bg-brand/90"
              disabled
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Assistant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assistants.map((assistant: any) => (
            <Card
              key={assistant.id}
              className="rounded-2xl border-brand/20 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group"
            >
              <CardHeader className="bg-gradient-to-r from-brand/5 to-transparent group-hover:from-brand/10 transition-all duration-300 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Bot className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <CardTitle className="text-brand group-hover:text-brand/80 transition-colors duration-200">
                        {assistant.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        {assistant.description || "No description"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={assistant.is_active ? "default" : "secondary"}
                    className={assistant.is_active ? "bg-green-500" : ""}
                  >
                    {assistant.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-brand/5 transition-colors duration-200">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium">{assistant.model_config?.model || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-brand/5 transition-colors duration-200">
                    <span className="text-muted-foreground">Voice</span>
                    <span className="font-medium flex items-center">
                      <Mic className="h-3 w-3 mr-1" />
                      {assistant.voice_config?.provider || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-brand/5 transition-colors duration-200">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(assistant.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl hover:bg-brand/10 hover:text-brand hover:border-brand transition-all duration-200"
                    disabled
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all duration-200"
                    onClick={() => setDeleteId(assistant.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voice Assistant?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the voice assistant
              and remove it from all assigned phone numbers.
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
