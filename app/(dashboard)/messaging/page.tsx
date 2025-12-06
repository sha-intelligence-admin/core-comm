"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddChannelModal } from "@/components/add-channel-modal"
import { Badge } from "@/components/ui/badge"
import { useMessagingChannels } from "@/hooks/use-messaging-channels"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
    MessageCircle,
    Plus,
    Settings,
    MoreVertical,
    CheckCircle,
    MessageSquare,
    Send,
    Clock,
    TrendingUp,
    Activity,
    Download,
    FileText,
    Inbox,
    Workflow,
    Globe,
    Users,
    ThumbsUp,
    BarChart3,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const keyCapabilities = [
    "Full omnichannel messaging dashboard",
    "AI-powered conversational routing & automation",
    "Human takeover & team collaboration tools",
    "Multi-language support and sentiment understanding",
]

const integrationSteps = [
    {
        step: "Click Add Channel",
        detail: "Navigate to Dashboard → Messaging → Add Channel",
    },
    {
        step: "Select a platform",
        detail: "Choose WhatsApp Business API, Telegram Bot, Website Chat Widget, or Discord Server",
    },
    {
        step: "Follow authentication",
        detail: "Complete the guided token setup and authentication process",
    },
    {
        step: "Grant permissions",
        detail: "Allow CoreComm to send and receive messages on your behalf",
    },
    {
        step: "Assign to agent",
        detail: "Connect the channel to a Messaging Agent or routing rule",
    },
]

const messagingFeatures = [
    {
        feature: "Real-Time Chat Syncing",
        description: "Messages from all platforms appear instantly in one unified inbox",
    },
    {
        feature: "Typing Indicators & Previews",
        description: "See when the user is typing and preview message drafts",
    },
    {
        feature: "Multi-Language Replies",
        description: "Automatic translation & localized responses",
    },
    {
        feature: "AI Intent Classification",
        description: "Categorizes messages (Billing, Tech Support, Sales, General Inquiry)",
    },
    {
        feature: "Automated Response Suggestions",
        description: "AI proposes answers before sending",
    },
    {
        feature: "Human Handover Button",
        description: "Instantly escalate a conversation to a human agent",
    },
    {
        feature: "Smart Conversation Routing",
        description: "Assigns chats to the correct department based on message context",
    },
    {
        feature: "Conversation Notes and Tags",
        description: "Helps teams coordinate and track cases",
    },
]

export default function MessagingPage() {
    const { channels, loading, error, deleteChannel } = useMessagingChannels()

    // Calculate real metrics from channels data
    const totalMessagesHandled = channels.reduce((sum, channel) => 
        sum + channel.total_messages_sent + channel.total_messages_received, 0
    )
    const avgResponseTime = channels.length > 0
        ? (channels.reduce((sum, channel) => sum + channel.avg_response_time, 0) / channels.length).toFixed(1)
        : "0.0"
    const avgResponseRate = channels.length > 0
        ? (channels.reduce((sum, channel) => sum + channel.response_rate, 0) / channels.length).toFixed(1)
        : "0.0"
    const activeChannelsCount = channels.filter(c => c.status === 'active').length
    const totalConversations = channels.reduce((sum, channel) => sum + channel.total_conversations, 0)

    // Real analytics metrics calculated from database
    const calculatedMetrics = [
        {
            label: "Messages Handled",
            value: loading ? "..." : totalMessagesHandled.toLocaleString(),
            description: "Total inbound & outbound",
            icon: MessageSquare,
        },
        {
            label: "Response Time",
            value: loading ? "..." : `${avgResponseTime}s`,
            description: "Avg time to first reply",
            icon: Clock,
        },
        {
            label: "Response Rate",
            value: loading ? "..." : `${avgResponseRate}%`,
            description: "Average response rate",
            icon: ThumbsUp,
        },
        {
            label: "Total Conversations",
            value: loading ? "..." : totalConversations.toLocaleString(),
            description: "Across all channels",
            icon: CheckCircle,
        },
        {
            label: "Active Channels",
            value: loading ? "..." : activeChannelsCount.toString(),
            description: "Connected platforms",
            icon: Activity,
        },
        {
            label: "Total Channels",
            value: loading ? "..." : channels.length.toString(),
            description: "All configured channels",
            icon: MessageCircle,
        },
    ]

    const handleDeleteChannel = async (id: string) => {
        if (confirm('Are you sure you want to disconnect this channel?')) {
            await deleteChannel(id)
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

    const getPlatformDisplay = (channelType: string) => {
        const platforms: Record<string, string> = {
            whatsapp: 'WhatsApp Business',
            telegram: 'Telegram Bot',
            messenger: 'Facebook Messenger',
            slack: 'Slack',
            discord: 'Discord',
            sms: 'SMS',
            webchat: 'Website Chat',
        }
        return platforms[channelType] || channelType
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
                <p className="text-destructive">Error loading messaging channels: {error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
    }
    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="google-headline-medium">Messaging</h1>
                        <Badge variant="outline" className="rounded-full border-0 bg-yellow-500/20 text-yellow-600">
                            Coming Soon
                        </Badge>
                    </div>
                    <p className="google-body-medium text-muted-foreground">
                        Centralize all chat platforms into a single AI-powered conversation hub
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <AddChannelModal>
                        <Button className="h-11 rounded-sm px-6 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Connect Channel
                        </Button>
                    </AddChannelModal>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <Workflow className="mr-2 h-4 w-4" />
                        Automation Rules
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
                        Messaging analytics
                    </div>
                    <div className="google-body-medium text-muted-foreground">
                        Performance and behavior insights across all messaging channels
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
                    <div className="google-headline-small">Active channels</div>
                    <div className="google-body-medium text-muted-foreground">
                        Manage your configured messaging channels and assignments
                    </div>
                </CardHeader>
                <CardContent>
                    {channels.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="google-title-medium text-foreground mb-2">No channels connected</h3>
                            <p className="google-body-medium text-muted-foreground mb-4">
                                Connect your first messaging channel to start managing conversations
                            </p>
                            <AddChannelModal>
                                <Button className="rounded-sm text-white">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Connect Channel
                                </Button>
                            </AddChannelModal>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {channels.map((channel) => (
                                <div
                                    key={channel.id}
                                    className="flex flex-col gap-4 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted lg:flex-row lg:items-center lg:justify-between"
                                >
                                    <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
                                        <div className="flex items-center gap-3">
                                            <MessageSquare className="h-4 w-4 text-primary" />
                                            <div>
                                                <div className="google-title-small text-foreground">{channel.channel_name}</div>
                                                <div className="google-body-small text-muted-foreground mt-1">
                                                    {getPlatformDisplay(channel.channel_type)} • {channel.provider}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {channel.phone_number && (
                                                <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                                    {channel.phone_number}
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className={`rounded-full border-0 ${getStatusColor(channel.status)}`}>
                                                {channel.status}
                                            </Badge>
                                            <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                                {channel.total_conversations} conversations
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
                                                    View Analytics
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                                                    View Conversations
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                                                    Edit Settings
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleDeleteChannel(channel.id)}
                                                >
                                                    Disconnect Channel
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
                            Follow these steps to connect a new messaging channel
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
                        <div className="google-headline-small text-foreground">Platform features</div>
                        <div className="google-body-medium text-muted-foreground">
                            Powerful capabilities across all messaging channels
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {messagingFeatures.slice(0, 4).map((item) => (
                                <div
                                    key={item.feature}
                                    className="rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                                >
                                    <div className="google-title-small text-foreground">{item.feature}</div>
                                    <p className="google-body-small text-muted-foreground mt-1">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground">Advanced features</div>
                    <div className="google-body-medium text-muted-foreground">
                        AI-powered tools to enhance messaging automation and team collaboration
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {messagingFeatures.slice(4).map((item) => (
                            <div
                                key={item.feature}
                                className="rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                            >
                                <div className="google-title-small text-foreground">{item.feature}</div>
                                <p className="google-body-small text-muted-foreground mt-1">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>


        </div>
    )
}
