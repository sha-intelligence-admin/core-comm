"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Database, 
  Cloud, 
  Check, 
  Server, 
  Settings, 
  Cpu, 
  Loader2, 
  FileText, 
  Link as LinkIcon 
} from "lucide-react"

type WizardStep = 'STRATEGY_SELECTION' | 'BYOK_CONFIG' | 'MANAGED_CONFIG';
type Strategy = 'BYOK' | 'MANAGED' | null;

interface FormData {
  name: string
  provider: string
  config: Record<string, any>
  domain?: string
  languages: string[]
}

export default function CreateKnowledgeBasePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [step, setStep] = useState<WizardStep>('STRATEGY_SELECTION')
  const [strategy, setStrategy] = useState<Strategy>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    provider: "",
    config: {},
    languages: ["en"]
  })

  const handleStrategySelect = (selected: Strategy) => {
    setStrategy(selected)
    if (selected === 'BYOK') {
      setStep('BYOK_CONFIG')
    } else {
      setStep('MANAGED_CONFIG')
      setFormData(prev => ({ ...prev, provider: 'native' }))
    }
  }

  const handleValidation = async () => {
    setIsValidating(true)
    setValidationResult(null)
    try {
      const res = await fetch('/api/knowledge-bases/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: formData.provider,
          config: formData.config
        })
      })
      const data = await res.json()
      setValidationResult(data)
      
      if (data.valid) {
        toast({ title: "Connection Successful", description: "Successfully connected to your Knowledge Base provider." })
      } else {
        toast({ variant: "destructive", title: "Connection Failed", description: data.message })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to validate connection" })
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const payload = {
        name: formData.name,
        type: strategy,
        provider: formData.provider,
        config: formData.config,
        domain: formData.domain,
        languages: formData.languages,
        validate: strategy === 'BYOK' // Force server-side validation again for BYOK
      }

      const res = await fetch('/api/knowledge-bases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create Knowledge Base')
      }

      const kb = await res.json()
      toast({ title: "Success", description: "Knowledge Base created successfully" })
      
      // Redirect to the details page (assuming it exists or will exist)
      // For now redirect back to list
      router.push(`/knowledge-bases/${kb.id}`)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Creation Failed", description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const updateConfig = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }))
  }

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Knowledge Bases</span>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="google-headline-medium">Create Knowledge Base</h1>
          <p className="text-muted-foreground">Configure a new knowledge source for your AI agents.</p>
        </div>

        {step === 'STRATEGY_SELECTION' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card 
              className="cursor-pointer hover:border-primary hover:bg-muted/50 transition-all"
              onClick={() => handleStrategySelect('BYOK')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Bring Your Own (BYOK)</CardTitle>
                <CardDescription>Connect to your existing vector database provider.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Connect Qdrant, Pinecone, Weaviate</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Zero data migration required</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Use your existing embeddings</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary hover:bg-muted/50 transition-all"
              onClick={() => handleStrategySelect('MANAGED')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Cloud className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Managed (Hosted)</CardTitle>
                <CardDescription>Upload files and let us handle the infrastructure.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Upload PDF, DOCX, TXT</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Automatic chunking & embedding</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Instant Vapi integration</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'BYOK_CONFIG' && (
          <Card>
             <CardHeader>
                <CardTitle>Configure Connection</CardTitle>
                <CardDescription>Enter your provider details to connect.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid gap-2">
                    <Label>Knowledge Base Name</Label>
                    <Input 
                      placeholder="e.g. Production Help Center" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                 </div>

                 <div className="grid gap-2">
                    <Label>Provider</Label>
                    <Select 
                        value={formData.provider} 
                        onValueChange={(val) => setFormData({...formData, provider: val})}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="qdrant">Qdrant</SelectItem>
                            <SelectItem value="pinecone">Pinecone</SelectItem>
                            <SelectItem value="weaviate">Weaviate</SelectItem>
                            <SelectItem value="openai">OpenAI Vector Store</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>

                 {formData.provider && (
                    <div className="space-y-4 pt-4 border-t">
                        {formData.provider === 'qdrant' && (
                            <>
                                <div className="grid gap-2">
                                    <Label>Cluster URL</Label>
                                    <Input 
                                        placeholder="https://xyz-example.us-east-1.aws.cloud.qdrant.io" 
                                        onChange={(e) => updateConfig('url', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>API Key</Label>
                                    <Input 
                                        type="password" 
                                        placeholder="th7..." 
                                        onChange={(e) => updateConfig('apiKey', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Collection Name</Label>
                                    <Input 
                                        placeholder="my_collection" 
                                        onChange={(e) => updateConfig('collectionName', e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                        {/* Add other provider forms as needed */}
                        
                        <div className="flex items-center gap-4 pt-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleValidation}
                                disabled={isValidating}
                            >
                                {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Test Connection
                            </Button>
                            {validationResult?.valid && (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                    <Check className="mr-1 h-3 w-3" /> Connection Valid
                                </Badge>
                            )}
                            {validationResult?.valid === false && (
                                <Badge variant="destructive">
                                    Connection Failed
                                </Badge>
                            )}
                        </div>
                    </div>
                 )}
              </CardContent>
              <CardFooter className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep('STRATEGY_SELECTION')}>Change Strategy</Button>
                  <Button onClick={handleSubmit} disabled={isLoading || (strategy === 'BYOK' && !validationResult?.valid)}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Knowledge Base
                  </Button>
              </CardFooter>
          </Card>
        )}

        {step === 'MANAGED_CONFIG' && (
           <Card>
             <CardHeader>
                <CardTitle>Create Managed Knowledge Base</CardTitle>
                <CardDescription>Setup your knowledge base metadata. You can upload files on the next screen.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input 
                      placeholder="e.g. Company Manuals" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                 </div>
                 <div className="grid gap-2">
                    <Label>Language</Label>
                     <Select 
                        value={formData.languages[0]} 
                        onValueChange={(val) => setFormData({...formData, languages: [val]})}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select primary language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep('STRATEGY_SELECTION')}>Change Strategy</Button>
                  <Button onClick={handleSubmit} disabled={isLoading || !formData.name}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create & Continue to Upload
                  </Button>
              </CardFooter>
           </Card>
        )}
      </div>
    </div>
  )
}
