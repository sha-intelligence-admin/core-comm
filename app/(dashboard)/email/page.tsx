"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Mail,
    Plus,
    Settings,
    MoreVertical,
    CheckCircle,
    Clock,
    TrendingUp,
    Activity,
    Download,
    FileText,
    Inbox,
    Users,
    ThumbsUp,
    BarChart3,
    ArrowRight,
    Paperclip,
    Globe,
    Forward,
    ArrowDown,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const keyCapabilities = [
    "AI-powered email analysis and categorization",
    "Automated professional response generation",
    "Smart forwarding rules and escalation workflows",
    "Attachment reading and context extraction",
]

const integrationSteps = [
    {
        step: "Navigate to Email",
        detail: "Go to Dashboard → Email → Connect Account",
    },
    {
        step: "Choose your provider",
        detail: "Select Gmail, Outlook, or configure Custom IMAP/SMTP",
    },
    {
        step: "Authorize access",
        detail: "Complete OAuth authentication to grant CoreComm secure access",
    },
    {
        step: "Assign AI Agent",
        detail: "Connect an AI Email Agent for automated reply handling",
    },
    {
        step: "Configure preferences",
        detail: "Set up routing rules, response tone, and escalation triggers",
    },
]

const emailCapabilities = [
    {
        capability: "Auto-Response",
        description: "Generates contextual replies using your company tone and knowledge base",
        icon: Mail,
    },
    {
        capability: "Email Classification",
        description: "Automatically labels as Inquiry, Complaint, Billing, Technical Support, etc.",
        icon: FileText,
    },
    {
        capability: "Forwarding Rules",
        description: "Route specific topics or priority levels to human staff automatically",
        icon: Forward,
    },
    {
        capability: "Attachment Reading",
        description: "Extracts context from documents (PDF, DOCX) to inform AI responses",
        icon: Paperclip,
    },
    {
        capability: "Language Translation",
        description: "Auto-translate incoming emails and respond in the customer's language",
        icon: Globe,
    },
]

const analyticsMetrics = [
    {
        label: "Total Emails Processed",
        value: "8,247",
        description: "AI + human handled",
        icon: Mail,
        trend: "+22.4%",
    },
    {
        label: "Avg Response Time",
        value: "4.2 min",
        description: "Speed of first AI reply",
        icon: Clock,
        trend: "-18.7%",
    },
    {
        label: "Auto-Resolved",
        value: "6,851",
        description: "Closed without human input",
        icon: CheckCircle,
        trend: "+15.3%",
    },
    {
        label: "Human Escalations",
        value: "1,396",
        description: "Forwarded to team inbox",
        icon: Users,
        trend: "+8.1%",
    },
    {
        label: "Customer Satisfaction",
        value: "4.7/5",
        description: "Based on sentiment detection",
        icon: ThumbsUp,
        trend: "+6.2%",
    },
    {
        label: "Active Accounts",
        value: "5",
        description: "Connected email accounts",
        icon: Activity,
        trend: "+1 new",
    },
]

const mockAccounts = [
    {
        id: "1",
        email: "support@corecomm.io",
        provider: "Gmail",
        agent: "Customer Support Bot",
        purpose: "Customer Inquiries",
        status: "active",
        emailsToday: 143,
    },
    {
        id: "2",
        email: "billing@corecomm.io",
        provider: "Outlook",
        agent: "Billing Assistant Bot",
        purpose: "Payment & Invoices",
        status: "active",
        emailsToday: 67,
    },
    {
        id: "3",
        email: "sales@corecomm.io",
        provider: "Gmail",
        agent: "Sales Lead Bot",
        purpose: "Lead Qualification",
        status: "active",
        emailsToday: 89,
    },
]

export default function EmailPage() {
    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h1 className="google-headline-medium">Email</h1>
                    <p className="google-body-medium text-muted-foreground">
                        Let AI handle customer emails with professional automated responses
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button className="h-11 rounded-sm px-6 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Connect Account
                    </Button>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <Settings className="mr-2 h-4 w-4" />
                        Routing Rules
                    </Button>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <Inbox className="mr-2 h-4 w-4" />
                        Open Inbox
                    </Button>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <Download className="mr-2 h-4 w-4" />
                        Export Analytics
                    </Button>
                </div>
            </div>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Email analytics
                    </div>
                    <div className="google-body-medium text-muted-foreground">
                        Performance insights and automation metrics across all email accounts
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {analyticsMetrics.map((metric) => (
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
                    <div className="google-headline-small">Connected accounts</div>
                    <div className="google-body-medium text-muted-foreground">
                        Manage your configured email accounts and AI agent assignments
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {mockAccounts.map((account) => (
                            <div
                                key={account.id}
                                className="flex gap-4 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted items-center justify-between"
                            >
                                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-primary" />
                                        <div>
                                            <div className="google-title-small text-foreground">{account.email}</div>
                                            <div className="google-body-small text-muted-foreground mt-1">
                                                {account.provider} • {account.purpose}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                            {account.agent}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-500">
                                            {/* <CheckCircle className="mr-1 h-3 w-3" /> */}
                                            {account.status}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                            {account.emailsToday} emails today
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
                                        <span className="hidden sm:inline">Configure</span>
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
                                                View Inbox
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                                                Edit Routing
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                                Disconnect Account
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                    <CardHeader className="rounded-t-sm">
                        <div className="google-headline-small text-foreground">Integration steps</div>
                        <div className="google-body-medium text-muted-foreground">
                            Connect your email account in just a few clicks
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {integrationSteps.map((item, index) => (
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
                        <div className="google-headline-small text-foreground">Example workflow</div>
                        <div className="google-body-medium text-muted-foreground">
                            See how AI handles a typical customer email
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            <div className="rounded-sm border border-input bg-muted/40 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-full bg-primary/20 p-1.5">
                                        <Mail className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="google-title-small text-foreground">Customer sends email</div>
                                        <p className="google-body-small text-muted-foreground mt-1 italic">
                                            "I can't log into my account."
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <ArrowDown className="h-5 w-5 text-primary" />
                            </div>

                            <div className="rounded-sm border border-input bg-muted/40 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-full bg-primary/20 p-1.5">
                                        <Activity className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="google-title-small text-foreground">AI identifies issue</div>
                                        <p className="google-body-small text-muted-foreground mt-1">
                                            Classifies as "Technical Support - Login Issue"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <ArrowDown className="h-5 w-5 text-primary" />
                            </div>

                            <div className="rounded-sm border border-input bg-muted/40 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-full bg-primary/20 p-1.5">
                                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="google-title-small text-foreground">AI sends solution</div>
                                        <p className="google-body-small text-muted-foreground mt-1">
                                            Replies with password reset steps and logs event to Analytics
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground">Platform capabilities</div>
                    <div className="google-body-medium text-muted-foreground">
                        Powerful AI features for email automation and intelligence
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {emailCapabilities.map((item) => (
                            <div
                                key={item.capability}
                                className="rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <item.icon className="h-5 w-5 text-primary" />
                                    <div className="google-title-small text-foreground">{item.capability}</div>
                                </div>
                                <p className="google-body-small text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
