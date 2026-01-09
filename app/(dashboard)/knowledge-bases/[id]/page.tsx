"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Upload, Link as LinkIcon, FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react"

export default function KnowledgeBaseDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    const [kb, setKb] = useState<any>(null)
    const [sources, setSources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [ingesting, setIngesting] = useState(false)
    
    // Ingestion Form State
    const [urlInput, setUrlInput] = useState("")
    const [textInput, setTextInput] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (id) fetchKbDetails()
    }, [id])

    const handleDeleteKb = async () => {
        if (!confirm("Are you sure you want to delete this Knowledge Base? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/knowledge-bases/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");
            
            toast({ title: "Deleted", description: "Knowledge Base deleted successfully." });
            router.push('/knowledge-bases');
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete Knowledge Base." });
            setIsDeleting(false);
        }
    }

    const fetchKbDetails = async () => {
        setLoading(true)
        const { data: kbData, error } = await supabase
            .from('knowledge_bases')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load Knowledge Base" })
            setLoading(false)
            return
        }
        setKb(kbData)

        if (kbData.type === 'MANAGED') {
            const { data: sourceData } = await supabase
                .from('knowledge_base_sources')
                .select('*')
                .eq('kb_id', id)
                .order('created_at', { ascending: false })
            setSources(sourceData || [])
        }
        setLoading(false)
    }

    const handleIngest = async (type: 'url' | 'text', content: string) => {
        if (!content) return
        setIngesting(true)
        try {
            const res = await fetch(`/api/knowledge-bases/${id}/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, content })
            })
            if (!res.ok) throw new Error('Ingestion request failed')
            
            toast({ title: "Ingestion Started", description: "Source has been added to the queue." })
            setUrlInput("")
            setTextInput("")
            fetchKbDetails() // Refresh list
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to add source" })
        } finally {
            setIngesting(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIngesting(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch(`/api/knowledge-bases/${id}/ingest`, {
                method: 'POST',
                body: formData
            })
            if (!res.ok) throw new Error('Upload failed')
            
            toast({ title: "File Uploaded", description: `${file.name} has been processed and added.` })
            fetchKbDetails() 
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to upload file" })
        } finally {
            setIngesting(false)
            e.target.value = '' // Reset input
        }
    }

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
    if (!kb) return <div className="p-10">Knowledge Base not found</div>

    return (
        <div className="container py-10">
            <div className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => router.push('/knowledge-bases')}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Knowledge Bases</span>
            </div>

            <div className="flex justify-between items-start mb-6">
                <div>
                   <h1 className="google-headline-medium mb-2">{kb.name}</h1>
                   <div className="flex items-center gap-2">
                      <Badge variant={kb.type === 'BYOK' ? 'secondary' : 'default'}>{kb.type}</Badge>
                      <Badge variant="outline" className="border-input">{kb.provider}</Badge>
                      <span className="text-sm text-muted-foreground ml-2 capitalize">Status: {kb.status.toLowerCase()}</span>
                   </div>
                </div>
                <Button variant="outline">Settings</Button>
            </div>

            <Tabs defaultValue={kb.type === 'MANAGED' ? 'sources' : 'overview'}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {kb.type === 'MANAGED' && <TabsTrigger value="sources">Sources</TabsTrigger>}
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
                        <CardContent>
                            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                                {JSON.stringify(kb.config, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sources" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="text-lg font-semibold">Active Sources</h3>
                            {sources.length === 0 && <div className="text-muted-foreground text-sm">No sources added yet.</div>}
                            {sources.map(source => (
                                <Card key={source.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {source.type === 'url' ? <LinkIcon className="h-4 w-4 text-blue-500" /> : <FileText className="h-4 w-4 text-orange-500" />}
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm truncate max-w-[300px]">
                                                {source.metadata?.filename || source.content}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{new Date(source.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <IngestionStatusBadge status={source.status} />
                                </Card>
                            ))}
                        </div>

                        <div className="space-y-6">
                             <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        <CardTitle className="text-md">Upload File</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Input 
                                            id="file-upload" 
                                            type="file" 
                                            accept=".txt,.md,.json,.csv,.xml,.pdf,.docx" 
                                            onChange={handleFileUpload} 
                                            disabled={ingesting}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Supported: .pdf, .docx, .txt, .md, .csv
                                    </p>
                                </CardContent>
                             </Card>

                             <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4" />
                                        <CardTitle className="text-md">Add URL</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Input 
                                        placeholder="https://example.com/docs" 
                                        value={urlInput}
                                        onChange={e => setUrlInput(e.target.value)}
                                    />
                                    <Button 
                                        size="sm" 
                                        className="w-full" 
                                        onClick={() => handleIngest('url', urlInput)}
                                        disabled={ingesting || !urlInput}
                                    >
                                        Add to Knowledge Base
                                    </Button>
                                </CardContent>
                             </Card>

                             <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <CardTitle className="text-md">Paste Text</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Input 
                                        placeholder="Paste content here..." 
                                        value={textInput}
                                        onChange={e => setTextInput(e.target.value)}
                                    />
                                    <Button 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleIngest('text', textInput)}
                                        disabled={ingesting || !textInput}
                                    >
                                        Ingest Text
                                    </Button>
                                </CardContent>
                             </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Update your knowledge base configuration.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Knowledge Base Name</label>
                                <Input disabled value={kb.name} />
                                <p className="text-xs text-muted-foreground">Renaming is specifically disabled for MVP.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Irreversible actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Delete Knowledge Base</p>
                                    <p className="text-sm text-muted-foreground">Permanently remove this KB and all its sources.</p>
                                </div>
                                <Button variant="destructive" onClick={handleDeleteKb} disabled={isDeleting}>
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin"/> : "Delete KB"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function IngestionStatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'completed': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50"><CheckCircle className="w-3 h-3 mr-1"/> Ready</Badge>
        case 'processing': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Processing</Badge>
        case 'failed': return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1"/> Failed</Badge>
        default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>
    }
}
