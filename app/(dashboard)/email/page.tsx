"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEmailAccounts } from "@/hooks/use-email-accounts"
import { LoadingSpinner } from "@/components/loading-spinner"
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

export default function EmailPage() {
    const { accounts, loading, error, deleteAccount } = useEmailAccounts()

    // Calculate real metrics from accounts data
    const totalEmailsProcessed = accounts.reduce((sum, account) => 
        sum + account.total_emails_sent + account.total_emails_received, 0
    )
    const totalEmailsReplied = accounts.reduce((sum, account) => sum + account.total_emails_replied, 0)
    const avgResponseTime = accounts.length > 0
        ? (accounts.reduce((sum, account) => sum + account.avg_response_time, 0) / accounts.length / 60).toFixed(1)
        : "0.0"
    const activeAccountsCount = accounts.filter(a => a.status === 'active').length
    const totalEmailsSent = accounts.reduce((sum, account) => sum + account.total_emails_sent, 0)
    const totalEmailsReceived = accounts.reduce((sum, account) => sum + account.total_emails_received, 0)

    // Real analytics metrics calculated from database
    const calculatedMetrics = [
        {
            label: "Total Emails Processed",
            value: loading ? "..." : totalEmailsProcessed.toLocaleString(),
            description: "Sent + received",
            icon: Mail,
        },
        {
            label: "Avg Response Time",
            value: loading ? "..." : `${avgResponseTime} min`,
            description: "Speed of first AI reply",
            icon: Clock,
        },
        {
            label: "Emails Replied",
            value: loading ? "..." : totalEmailsReplied.toLocaleString(),
            description: "Total responses sent",
            icon: CheckCircle,
        },
        {
            label: "Emails Sent",
            value: loading ? "..." : totalEmailsSent.toLocaleString(),
            description: "Outgoing emails",
            icon: ArrowRight,
        },
        {
            label: "Emails Received",
            value: loading ? "..." : totalEmailsReceived.toLocaleString(),
            description: "Incoming emails",
            icon: ArrowDown,
        },
        {
            label: "Active Accounts",
            value: loading ? "..." : activeAccountsCount.toString(),
            description: "Connected email accounts",
            icon: Activity,
        },
    ]

    const handleDeleteAccount = async (id: string) => {
        if (confirm('Are you sure you want to disconnect this email account?')) {
            await deleteAccount(id)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/20 text-green-500'
            case 'inactive':
                return 'bg-gray-500/20 text-gray-500'
            case 'suspended':
                return 'bg-yellow-500/20 text-yellow-500'
            case 'pending':
                return 'bg-blue-500/20 text-blue-500'
            case 'error':
                return 'bg-red-500/20 text-red-500'
            default:
                return 'bg-gray-500/20 text-gray-500'
        }
    }

    const getProviderDisplay = (provider: string) => {
        const providers: Record<string, string> = {
            gmail: 'Gmail',
            outlook: 'Outlook',
            exchange: 'Exchange',
            imap: 'IMAP',
            smtp: 'SMTP',
            other: 'Other',
        }
        return providers[provider] || provider
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <p className="text-destructive">Error loading email accounts: {error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
    }
    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="google-headline-medium">Email</h1>
                        <Badge variant="outline" className="rounded-full border-0 bg-yellow-500/20 text-yellow-600">
                            Coming Soon
                        </Badge>
                    </div>
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
                        {calculatedMetrics.map((metric) => (
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
                    <div className="google-headline-small">Connected accounts</div>
                    <div className="google-body-medium text-muted-foreground">
                        Manage your configured email accounts and AI agent assignments
                    </div>
                </CardHeader>
                <CardContent>
                    {accounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="google-title-medium text-foreground mb-2">No email accounts connected</h3>
                            <p className="google-body-medium text-muted-foreground mb-4">
                                Connect your first email account to start automating responses
                            </p>
                            <Button className="rounded-sm text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Connect Account
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {accounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="flex gap-4 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted items-center justify-between"
                                >
                                    <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-primary" />
                                            <div>
                                                <div className="google-title-small text-foreground">{account.email_address}</div>
                                                <div className="google-body-small text-muted-foreground mt-1">
                                                    {getProviderDisplay(account.provider)} • {account.account_name}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className={`rounded-full border-0 ${getStatusColor(account.status)}`}>
                                                {account.status}
                                            </Badge>
                                            <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                                {account.total_emails_sent + account.total_emails_received} emails
                                            </Badge>
                                            {account.auto_reply_enabled && (
                                                <Badge variant="outline" className="rounded-full border-input bg-blue-500/20 text-blue-500">
                                                    Auto-reply ON
                                                </Badge>
                                            )}
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
                                                    View Analytics
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                                                    View Inbox
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                                                    Edit Settings
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleDeleteAccount(account.id)}
                                                >
                                                    Disconnect Account
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
