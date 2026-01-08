"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useKnowledgeBases } from "@/hooks/use-knowledge-bases"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, BookOpen, Trash2, Database, Cloud } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

export default function KnowledgeBasesListPage() {
  const router = useRouter()
  const { knowledgeBases, isLoading, error, deleteKnowledgeBase } = useKnowledgeBases()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteKnowledgeBase(deleteId)
      setDeleteId(null)
    } catch (err) {
      console.error('Failed to delete knowledge base:', err)
    } finally {
      setDeleting(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load knowledge bases: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 container  py-8">
      <div className="flex  items-center justify-between">
        <div>
          <h1 className="google-headline-medium">Knowledge Bases</h1>
          <p className="text-muted-foreground">Manage your AI knowledge sources configured for your agents.</p>
        </div>
        <Button
          onClick={() => router.push('/knowledge-bases/create')}
          className="shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Knowledge Base
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : knowledgeBases.length === 0 ? (
        <Card className="rounded-xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted p-4 rounded-full mb-4">
                 <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No Knowledge Bases</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              Create a knowledge base to allow your AI agents to answer questions based on your documents or existing vector database.
            </p>
            <Button onClick={() => router.push('/knowledge-bases/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first KB
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {knowledgeBases.map((kb: any) => (
            <Card 
                key={kb.id} 
                className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                onClick={() => router.push(`/knowledge-bases/${kb.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${kb.type === 'BYOK' ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'}`}>
                        {kb.type === 'BYOK' ? <Database className="h-5 w-5"/> : <Cloud className="h-5 w-5"/>}
                    </div>
                    <div>
                        <CardTitle className="text-base">{kb.name}</CardTitle>
                        <CardDescription className="text-xs mt-1 capitalize">
                            {kb.provider || 'Native'} Provider
                        </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                 <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs uppercase px-2 py-0 h-5">
                        {kb.type}
                    </Badge>
                    <Badge variant="outline" className={`text-xs uppercase px-2 py-0 h-5 ${
                        kb.status === 'READY' || kb.status === 'synced' ? 'border-green-200 text-green-700 bg-green-50' : 
                        kb.status === 'FAILED' ? 'border-red-200 text-red-700 bg-red-50' : 
                        'border-blue-200 text-blue-700 bg-blue-50'
                    }`}>
                        {kb.status || 'Unknown'}
                    </Badge>
                 </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Created {new Date(kb.created_at).toLocaleDateString()}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteId(kb.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the knowledge base
              and remove it from any assigned agents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
