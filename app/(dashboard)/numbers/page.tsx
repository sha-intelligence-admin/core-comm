"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddNumberModal } from "@/components/add-number-modal"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAssistants } from "@/hooks/use-assistants"
import { usePhoneNumbers, type PhoneNumber } from "@/hooks/use-phone-numbers"
import { Phone, Plus, Settings, MoreVertical, CheckCircle, BarChart3 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const addNumberSteps = [
    {
        step: "Click Add Number",
        detail: "Navigate to Dashboard → Numbers → Add Number",
    },
    {
        step: "Choose a provider",
        detail: "Select Twilio, Telnyx, Vonage, or bring your own",
    },
    {
        step: "Pick area code / number",
        detail: "We ask Vapi/Twilio for the closest available match",
    },
    {
        step: "Provision",
        detail: "CoreComm registers the number with Vapi + Twilio automatically",
    },
    {
        step: "Assign to Voice Agent",
        detail: "Route calls to your AI concierge or fail over to a human",
    },
]

const exampleConfiguration = [
    { field: "Number", value: "+1 415 555 0199" },
    { field: "Provider", value: "Twilio via Vapi" },
    { field: "Assigned To", value: "US Support Concierge" },
    { field: "Routing Mode", value: "Auto-answer → AI Assistant" },
    { field: "Failover Route", value: "Forward to Dispatch Desk" },
]

export default function NumbersPage() {
    const { phoneNumbers, loading, updatePhoneNumber, deletePhoneNumber } = usePhoneNumbers()
    const { assistants } = useAssistants()
    const [configureId, setConfigureId] = useState<string | null>(null)
    const [selectedAssistant, setSelectedAssistant] = useState<string | undefined>(undefined)
    const [busy, setBusy] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const configureTarget = phoneNumbers.find((number) => number.id === configureId)

    const metrics = useMemo(() => {
        const total = phoneNumbers.length
        const active = phoneNumbers.filter((n) => n.is_active).length
        const twilio = phoneNumbers.filter((n) => n.provider === "twilio").length
        const byo = phoneNumbers.filter((n) => n.provider === "byo").length
        const unassigned = phoneNumbers.filter((n) => !n.assistant_id).length

        return [
            {
                label: "Total Numbers",
                value: loading ? "..." : total.toString(),
                description: "Provisioned via Vapi",
                icon: Phone,
            },
            {
                label: "Active",
                value: loading ? "..." : active.toString(),
                description: "Currently routable",
                icon: CheckCircle,
            },
            {
                label: "Twilio Lines",
                value: loading ? "..." : twilio.toString(),
                description: "Purchased through Twilio",
                icon: BarChart3,
            },
            {
                label: "BYO",
                value: loading ? "..." : byo.toString(),
                description: "Bring-your-own numbers",
                icon: BarChart3,
            },
            {
                label: "Unassigned",
                value: loading ? "..." : unassigned.toString(),
                description: "Needs assistant routing",
                icon: Settings,
            },
        ]
    }, [loading, phoneNumbers])

    const openConfigure = (number: PhoneNumber) => {
        setConfigureId(number.id)
        setSelectedAssistant(number.assistant_id || undefined)
        setErrorMessage(null)
    }

    const handleToggleActive = async (number: PhoneNumber) => {
        setBusy(true)
        setErrorMessage(null)
        try {
            const result = await updatePhoneNumber(number.id, { isActive: !number.is_active })
            if (result && "error" in result) {
                throw new Error(result.error)
            }
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Failed to update phone number")
        } finally {
            setBusy(false)
        }
    }

    const handleDelete = async (number: PhoneNumber) => {
        setBusy(true)
        setErrorMessage(null)
        try {
            const result = await deletePhoneNumber(number.id)
            if (result && "error" in result) {
                throw new Error(result.error)
            }
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Failed to release number")
        } finally {
            setBusy(false)
        }
    }

    const handleConfigure = async () => {
        if (!configureId) return
        setBusy(true)
        setErrorMessage(null)
        try {
            const result = await updatePhoneNumber(configureId, {
                assistantId: selectedAssistant ?? null,
            })
            if (result && "error" in result) {
                throw new Error(result.error)
            }
            setConfigureId(null)
            setSelectedAssistant(undefined)
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Failed to configure number")
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 max-w-lg flex-1">
                    <h1 className="google-headline-medium">Numbers</h1>
                    <p className="google-body-medium text-muted-foreground">
                        Purchase, manage, and route phone numbers for your AI Voice Agents
                    </p>
                </div>
                <AddNumberModal assistants={assistants}>
                    <Button className="h-11 rounded-sm px-6 text-white whitespace-nowrap flex-shrink-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Number
                    </Button>
                </AddNumberModal>
            </div>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Voice analytics
                    </div>
                    <div className="google-body-medium text-muted-foreground">
                        Provisioning + routing stats pulled directly from Vapi/Twilio
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {metrics.map((metric) => (
                            <div
                                key={metric.label}
                                className="rounded-sm border border-input bg-metricCard p-4 transition-colors duration-200 hover:border-primary/60"
                            >
                                <div className="flex items-center justify-between">
                                    <metric.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="mt-3">
                                    <div className="google-headline-small text-foreground">{metric.value}</div>
                                    <div className="google-body-small text-muted-foreground">{metric.label}</div>
                                    <div className="google-body-small text-muted-foreground/70 mt-1">{metric.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small">Active numbers</div>
                    <div className="google-body-medium text-muted-foreground">
                        Manage the Twilio + Vapi resources tied to your workspace
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : phoneNumbers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-input bg-muted/40 py-12 text-center">
                            <Phone className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="google-title-large text-foreground mb-2">No phone numbers configured</h3>
                            <p className="google-body-medium text-muted-foreground mb-6 max-w-sm">
                                Get started by adding your first phone number. We handle Twilio + Vapi provisioning.
                            </p>
                            <AddNumberModal assistants={assistants}>
                                <Button className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Phone Number
                                </Button>
                            </AddNumberModal>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {phoneNumbers.map((number) => (
                                <div
                                    key={number.id}
                                    className="flex flex-col gap-4 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted lg:flex-row lg:items-center lg:justify-between"
                                >
                                    <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-primary" />
                                            <div>
                                                <div className="google-title-small text-foreground">{number.phone_number}</div>
                                                <div className="google-body-small text-muted-foreground mt-1">
                                                    {number.provider.toUpperCase()} • {number.country_code || "US"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                                {number.assigned_to ? `Assistant: ${number.assigned_to}` : "Unassigned"}
                                            </Badge>
                                            <Badge 
                                                variant="outline" 
                                                className={`rounded-full border-0 ${
                                                    number.is_active 
                                                        ? 'bg-green-500/20 text-green-500'
                                                        : 'bg-gray-500/20 text-gray-500'
                                                }`}
                                            >
                                                {number.is_active ? 'active' : 'inactive'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                                            onClick={() => openConfigure(number)}
                                        >
                                            <Settings className="mr-2 h-3 w-3" />
                                            Configure
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="hover:bg-primary/10 hover:text-primary"
                                                    onClick={() => openConfigure(number)}
                                                >
                                                    Assign Assistant
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="hover:bg-primary/10 hover:text-primary"
                                                    onClick={() => handleToggleActive(number)}
                                                >
                                                    {number.is_active ? 'Disable' : 'Enable'} routing
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleDelete(number)}
                                                >
                                                    Release Number
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                    <CardHeader className="rounded-t-sm">
                        <div className="google-headline-small text-foreground">Adding a number</div>
                        <div className="google-body-medium text-muted-foreground">
                            Follow these steps to purchase or import a phone number
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {addNumberSteps.map((item, index) => (
                                <div
                                    key={item.step}
                                    className="rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="google-title-small text-primary w-6">0{index + 1}</span>
                                        <div className="flex-1">
                                            <div className="google-title-small text-foreground">{item.step}</div>
                                            <p className="google-body-small text-muted-foreground mt-1">{item.detail}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                    <CardHeader className="rounded-t-sm">
                        <div className="google-headline-small text-foreground">Example configuration</div>
                        <div className="google-body-medium text-muted-foreground">
                            Typical setup for a Bay Area support line
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            {exampleConfiguration.map((item) => (
                                <div
                                    key={item.field}
                                    className="flex flex-col gap-1 rounded-sm border border-input bg-muted/40 p-3"
                                >
                                    <span className="google-body-small text-muted-foreground">{item.field}</span>
                                    <span className="google-title-small text-foreground">{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 rounded-sm border border-input bg-muted/40 p-3">
                            <div className="google-body-small text-muted-foreground">
                                <span className="font-medium text-foreground">Navigation:</span> Dashboard → Numbers → Add Number
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {errorMessage && (
                <div className="rounded-sm border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
                    {errorMessage}
                </div>
            )}

            <Dialog
                open={Boolean(configureId)}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfigureId(null)
                        setSelectedAssistant(undefined)
                        setErrorMessage(null)
                    }
                }}
            >
                <DialogContent className="sm:max-w-md rounded-sm">
                    <DialogHeader>
                        <DialogTitle>Configure number</DialogTitle>
                        <DialogDescription>
                            Route incoming calls and toggle availability for {configureTarget?.phone_number}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="assistant-select" className="text-sm text-muted-foreground">
                                Assign voice assistant
                            </Label>
                            <Select
                                value={selectedAssistant ?? "none"}
                                onValueChange={(value) => setSelectedAssistant(value === "none" ? undefined : value)}
                            >
                                <SelectTrigger id="assistant-select" className="rounded-sm">
                                    <SelectValue placeholder="Select assistant" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No assistant</SelectItem>
                                    {assistants.map((assistant: { id: string; name: string }) => (
                                        <SelectItem key={assistant.id} value={assistant.id}>
                                            {assistant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between rounded-sm border border-input bg-muted/40 px-3 py-2">
                            <div>
                                <p className="text-sm font-medium text-foreground">Enable routing</p>
                                <p className="text-xs text-muted-foreground">We keep Twilio + Vapi webhooks in sync.</p>
                            </div>
                            <Switch
                                checked={configureTarget?.is_active ?? true}
                                onCheckedChange={() => configureTarget && handleToggleActive(configureTarget)}
                                disabled={!configureTarget || busy}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfigureId(null)} disabled={busy}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfigure} disabled={busy}>
                            {busy ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
