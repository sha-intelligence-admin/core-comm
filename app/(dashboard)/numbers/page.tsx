"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddNumberModal } from "@/components/add-number-modal"
import { Badge } from "@/components/ui/badge"
import {
    Phone,
    Plus,
    Settings,
    MoreVertical,
    CheckCircle,
    PhoneOutgoing,
    BarChart3,
    Calendar,
    Users,
    Target,
    Repeat,
    Clock,
    PhoneMissed,
    Activity,
    ArrowUpRight,
    Globe,
    MonitorPlay,
    FileText,
    Download,
    TrendingUp,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const keyCapabilities = [
    "Buy new phone numbers directly from integrated providers",
    "Import existing numbers from your telephony system",
    "Assign or reassign numbers to any Voice Agent",
    "Configure call routing, fallback handlers, and voicemail logic",
]

const voiceAnalyticsMetrics = [
    {
        label: "Total Calls",
        value: "2,847",
        description: "Inbound + outbound",
        icon: Phone,
        trend: "+12.5%",
    },
    {
        label: "Average Call Duration",
        value: "4m 32s",
        description: "Mean conversation length",
        icon: Clock,
        trend: "-2.1%",
    },
    {
        label: "Missed Calls",
        value: "213",
        description: "Unanswered or dropped",
        icon: PhoneMissed,
        trend: "-8.3%",
    },
    {
        label: "Call Quality",
        value: "98.2%",
        description: "Audio clarity score",
        icon: Activity,
        trend: "+1.2%",
    },
    {
        label: "Escalations",
        value: "142",
        description: "Transferred to humans",
        icon: ArrowUpRight,
        trend: "-5.7%",
    },
    {
        label: "Global Routing",
        value: "24 regions",
        description: "Active call distribution",
        icon: Globe,
        trend: "+3 new",
    },
]

const addNumberSteps = [
    {
        step: "Click Add Number",
        detail: "Navigate to Dashboard → Numbers → Add Number",
    },
    {
        step: "Choose a provider",
        detail: "Select Twilio, Nexmo (Vonage), or Custom SIP (SIP URI or PBX system)",
    },
    {
        step: "Select Country and Number Type",
        detail: "Choose Local, Toll-Free, or Mobile / Virtual numbers",
    },
    {
        step: "Purchase or Import",
        detail: "Either purchase a new number or import an existing one from your system",
    },
    {
        step: "Assign to Voice Agent",
        detail: "Connect the number to one of your configured Voice Agents",
    },
]

const exampleConfiguration = [
    { field: "Number", value: "+44 203 998 4452" },
    { field: "Provider", value: "Twilio" },
    { field: "Assigned To", value: "UK Support Bot (Voice Agent)" },
    { field: "Routing Mode", value: "Auto-Answer → Conversation AI" },
    { field: "Failover Route", value: "Forward to Human Agent (Optional)" },
]

const mockNumbers = [
    {
        id: "1",
        number: "+44 203 998 4452",
        provider: "Twilio",
        type: "Local",
        agent: "UK Support Bot",
        status: "active",
        callsToday: 23,
    },
    {
        id: "2",
        number: "+1 (555) 123-4567",
        provider: "Twilio",
        type: "Toll-Free",
        agent: "US Customer Support",
        status: "active",
        callsToday: 47,
    },
    {
        id: "3",
        number: "+61 2 8765 4321",
        provider: "Nexmo",
        type: "Local",
        agent: "Australia Sales Bot",
        status: "active",
        callsToday: 12,
    },
]

export default function NumbersPage() {
    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 max-w-lg flex-1">
                    <h1 className="google-headline-medium">Numbers</h1>
                    <p className="google-body-medium text-muted-foreground">
                        Purchase, manage, and route phone numbers for your AI Voice Agents
                    </p>
                </div>
                <AddNumberModal>
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
                        Real-time performance analytics for all inbound and outbound calls
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {voiceAnalyticsMetrics.map((metric) => (
                            <div
                                key={metric.label}
                                className="rounded-sm border border-input bg-metricCard p-4 transition-colors duration-200 hover:border-primary/60"
                            >
                                <div className="flex items-center justify-between">
                                    <metric.icon className="h-5 w-5 text-primary" />
                                    <Badge
                                        variant="outline"
                                        className={`rounded-full border-0 ${metric.trend.startsWith("+")
                                            ? "bg-green-500/20 text-green-600"
                                            : metric.trend.startsWith("-")
                                                ? "bg-red-500/20 text-red-600"
                                                : "bg-blue-500/20 text-blue-600"
                                            }`}
                                    >
                                        {metric.trend}
                                    </Badge>
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
                        Manage your configured phone numbers and assignments
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {mockNumbers.map((number) => (
                            <div
                                key={number.id}
                                className="flex flex-col gap-4 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted lg:flex-row lg:items-center lg:justify-between"
                            >
                                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <div>
                                            <div className="google-title-small text-foreground">{number.number}</div>
                                            <div className="google-body-small text-muted-foreground mt-1">
                                                {number.provider} • {number.type}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                            {number.agent}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-500">
                                            {number.status}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                            {number.callsToday} calls today
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
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
                                            <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                                                Reassign Agent
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                                                View Call Logs
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                                                Edit Routing
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                                Release Number
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
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
                            Typical setup for a UK-based Voice Agent number
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

            {/* <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground flex items-center gap-2">
                        <PhoneOutgoing className="h-4 w-4 text-primary" />
                        Outbound calls
                    </div>
                    <div className="google-body-medium text-muted-foreground">
                        Initiate AI-driven phone calls automatically or on schedule
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <Button
                            variant="outline"
                            className="h-auto flex-col items-start gap-2 rounded-sm border-input bg-muted/40 p-4 text-left hover:border-primary hover:bg-muted"
                        >
                            <Settings className="h-5 w-5 text-primary" />
                            <div>
                                <div className="google-title-small text-foreground">Set Caller ID</div>
                                <p className="google-body-small text-muted-foreground mt-1">
                                    Configure per country, department, or campaign
                                </p>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto flex-col items-start gap-2 rounded-sm border-input bg-muted/40 p-4 text-left hover:border-primary hover:bg-muted"
                        >
                            <Target className="h-5 w-5 text-primary" />
                            <div>
                                <div className="google-title-small text-foreground">Launch Campaigns</div>
                                <p className="google-body-small text-muted-foreground mt-1">
                                    Follow-ups, feedback, sales outreach, and notifications
                                </p>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto flex-col items-start gap-2 rounded-sm border-input bg-muted/40 p-4 text-left hover:border-primary hover:bg-muted"
                        >
                            <Repeat className="h-5 w-5 text-primary" />
                            <div>
                                <div className="google-title-small text-foreground">Automate Callbacks</div>
                                <p className="google-body-small text-muted-foreground mt-1">
                                    After missed calls or failed conversations
                                </p>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto flex-col items-start gap-2 rounded-sm border-input bg-muted/40 p-4 text-left hover:border-primary hover:bg-muted"
                        >
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                                <div className="google-title-small text-foreground">Dialing Modes</div>
                                <p className="google-body-small text-muted-foreground mt-1">
                                    Progressive, preview, and predictive dialing
                                </p>
                            </div>
                        </Button>
                    </div>

                    <div>
                        <div className="google-title-small text-foreground mb-2">API endpoint</div>
                        <div className="rounded-sm border border-input bg-muted/40 p-3 overflow-x-auto">
                            <code className="google-body-small text-foreground whitespace-nowrap block">POST /api/v1/voice/outbound</code>
                        </div>
                    </div>

                    <div>
                        <div className="google-title-small text-foreground mb-2">Payload example</div>
                        <div className="rounded-sm border border-input bg-muted/40 p-3 overflow-x-auto">
                            <pre className="m-0">
                                <code className="google-body-small text-muted-foreground whitespace-pre block">
                                    {`{
  "number": "+14155550123",
  "agent_id": "agt_2938jh92",
  "script": "Hello, this is CoreComm checking on your recent order."
}`}
                                </code>
                            </pre>
                        </div>
                    </div>

                    <div className="rounded-sm border border-input bg-muted/40 p-3">
                        <div className="google-body-small text-muted-foreground space-y-1">
                            <div><span className="font-medium text-foreground">number</span> → the phone number being dialed</div>
                            <div><span className="font-medium text-foreground">agent_id</span> → Voice Agent initiating the call</div>
                            <div><span className="font-medium text-foreground">script</span> → Optional call script or system prompt</div>
                        </div>
                    </div>
                </CardContent>
            </Card> */}
        </div>
    )
}
