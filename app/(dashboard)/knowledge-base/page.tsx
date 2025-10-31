"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useKnowledgeBases, useKnowledgeBase } from "@/hooks/use-knowledge-bases"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, BookOpen, FileText, Upload, Trash2, Loader2, X } from "lucide-react"
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

export default function KnowledgeBasePage() {
  const { knowledgeBases, isLoading, error, createKnowledgeBase, deleteKnowledgeBase } = useKnowledgeBases()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedKB, setSelectedKB] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "" })

  const { knowledgeBase, files, uploadFile, deleteFile, refetch } = useKnowledgeBase(selectedKB)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await createKnowledgeBase({
        name: formData.name,
        description: formData.description,
        provider: "google",
      })
      setFormData({ name: "", description: "" })
      setCreateOpen(false)
    } catch (err) {
      console.error('Failed to create knowledge base:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteKnowledgeBase(deleteId)
      if (selectedKB === deleteId) {
        setSelectedKB(null)
      }
      setDeleteId(null)
    } catch (err) {
      console.error('Failed to delete knowledge base:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedKB || !e.target.files?.[0]) return

    const file = e.target.files[0]
    setUploading(true)
    try {
      await uploadFile(selectedKB, file)
      await refetch()
      e.target.value = "" // Reset input
    } catch (err) {
      console.error('Failed to upload file:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleFileDelete = async (fileId: string) => {
    if (!selectedKB) return
    try {
      await deleteFile(selectedKB, fileId)
      await refetch()
    } catch (err) {
      console.error('Failed to delete file:', err)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-brand/10 to-transparent p-6 rounded-2xl border border-brand/20">
          <h1 className="text-3xl font-bold tracking-tight text-brand">Knowledge Base</h1>
          <p className="text-muted-foreground">Manage knowledge sources for your voice agents</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load knowledge bases: {error.message}
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
            <h1 className="text-3xl font-bold tracking-tight text-brand">Knowledge Base</h1>
            <p className="text-muted-foreground">Manage knowledge sources for your voice agents</p>
          </div>
          <Button
            className="rounded-xl bg-brand hover:bg-brand/90 hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Knowledge Base
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Knowledge Bases List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold">Knowledge Bases</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : knowledgeBases.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center">
                  No knowledge bases yet
                </p>
              </CardContent>
            </Card>
          ) : (
            knowledgeBases.map((kb: any) => (
              <Card
                key={kb.id}
                className={`rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedKB === kb.id
                    ? "border-brand shadow-md bg-brand/5"
                    : "border-brand/20 hover:border-brand/40"
                }`}
                onClick={() => setSelectedKB(kb.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{kb.name}</CardTitle>
                      {kb.description && (
                        <CardDescription className="text-xs line-clamp-2 mt-1">
                          {kb.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(kb.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{kb.fileCount || 0} files</span>
                    <span>{new Date(kb.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Files Panel */}
        <div className="lg:col-span-2">
          {selectedKB ? (
            <Card className="rounded-2xl border-brand/20">
              <CardHeader className="bg-gradient-to-r from-brand/5 to-transparent rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-brand">{knowledgeBase?.name}</CardTitle>
                    <CardDescription>
                      {knowledgeBase?.description || "No description"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedKB(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-brand/30 rounded-xl p-6 hover:border-brand/50 transition-colors duration-200">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Upload className="h-10 w-10 text-brand/60" />
                    <div className="text-center">
                      <p className="text-sm font-medium">Upload files to knowledge base</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported: PDF, TXT, DOCX, CSV, MD, JSON, XML (Max 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.txt,.doc,.docx,.csv,.md,.json,.xml"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <Button
                      asChild
                      className="rounded-xl bg-brand hover:bg-brand/90"
                      disabled={uploading}
                    >
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </>
                        )}
                      </label>
                    </Button>
                  </div>
                </div>

                {/* Files List */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Files ({files.length})</h3>
                  {files.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No files uploaded yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {files.map((file: any) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-brand/5 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-brand flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.filename}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.file_size / 1024).toFixed(1)} KB •{" "}
                                {new Date(file.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={file.parsing_status === "completed" ? "default" : "secondary"}
                              className={`text-xs ${
                                file.parsing_status === "completed"
                                  ? "bg-green-500"
                                  : file.parsing_status === "failed"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                              }`}
                            >
                              {file.parsing_status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleFileDelete(file.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-brand/20">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a knowledge base to manage files
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create KB Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Knowledge Base</DialogTitle>
            <DialogDescription>
              Create a new knowledge base to store documents for your voice agents
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Product Documentation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of this knowledge base"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-brand hover:bg-brand/90"
              >
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete KB Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Base?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the knowledge base
              and all its files.
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
