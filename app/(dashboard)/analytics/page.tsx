"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    BarChart3,
    Download,
    Phone,
    MessageSquare,
    Mail,
    TrendingUp,
    Users,
    Activity,
    Clock,
    ThumbsUp,
    Target,
    Zap,
    FileText,
    Code,
    Eye,
    Filter,
    Calendar,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

const channelMetrics = [
    {
        channel: "Voice",
        icon: Phone,
        metrics: [
            { name: "Total Calls", value: "15,432", trend: "+12.3%" },
            { name: "Avg Duration", value: "4m 32s", trend: "-5.2%" },
            { name: "Call Routing", value: "94.7%", trend: "+3.1%" },
            { name: "Sentiment Score", value: "4.5/5", trend: "+6.8%" },
        ],
        description: "Track call volume, conversation length, routing efficiency, and customer mood analysis",
        importance: "Identifies peak call times, agent performance, and customer satisfaction trends",
    },
    {
        channel: "Messaging",
        icon: MessageSquare,
        metrics: [
            { name: "Messages Handled", value: "12,483", trend: "+18.2%" },
            { name: "Response Rate", value: "1.8s", trend: "-12.5%" },
            { name: "Resolution Rate", value: "87.4%", trend: "+5.8%" },
            { name: "Intent Detection", value: "92.1%", trend: "+4.3%" },
        ],
        description: "Monitor message volume, response speed, resolution efficiency, and AI classification accuracy",
        importance: "Reveals automation effectiveness and identifies common customer intents for optimization",
    },
    {
        channel: "Email",
        icon: Mail,
        metrics: [
            { name: "Emails Processed", value: "8,247", trend: "+22.4%" },
            { name: "Classification", value: "96.3%", trend: "+2.7%" },
            { name: "Auto-Resolve %", value: "83.1%", trend: "+15.3%" },
            { name: "Tone Match", value: "4.7/5", trend: "+6.2%" },
        ],
        description: "Analyze email categorization accuracy, automation success rate, and brand voice consistency",
        importance: "Measures AI effectiveness in handling emails while maintaining professional communication standards",
    },
]

const overallMetrics = [
    {
        label: "Combined Performance",
        value: "91.2%",
        description: "Unified success rate across all channels",
        icon: Target,
        trend: "+8.4%",
        data: [
            { name: 'Mon', value: 88 },
            { name: 'Tue', value: 90 },
            { name: 'Wed', value: 92 },
            { name: 'Thu', value: 89 },
            { name: 'Fri', value: 91 },
        ],
    },
    {
        label: "Agent Ranking",
        value: "Top 15",
        description: "Performance leaderboard positions",
        icon: Users,
        trend: "+3 spots",
        data: [
            { name: 'Mon', value: 18 },
            { name: 'Tue', value: 17 },
            { name: 'Wed', value: 16 },
            { name: 'Thu', value: 15 },
            { name: 'Fri', value: 15 },
        ],
    },
    {
        label: "Satisfaction Index",
        value: "4.6/5",
        description: "Aggregate customer sentiment",
        icon: ThumbsUp,
        trend: "+5.1%",
        data: [
            { name: 'Mon', value: 4.4 },
            { name: 'Tue', value: 4.5 },
            { name: 'Wed', value: 4.6 },
            { name: 'Thu', value: 4.5 },
            { name: 'Fri', value: 4.6 },
        ],
    },
    {
        label: "Total Interactions",
        value: "36,162",
        description: "All channels combined",
        icon: Activity,
        trend: "+16.7%",
        data: [
            { name: 'Mon', value: 5234 },
            { name: 'Tue', value: 5567 },
            { name: 'Wed', value: 5891 },
            { name: 'Thu', value: 5423 },
            { name: 'Fri', value: 5012 },
        ],
    },
    {
        label: "Avg Response Time",
        value: "2.4 min",
        description: "Cross-channel average",
        icon: Clock,
        trend: "-14.2%",
        data: [
            { name: 'Mon', value: 2.8 },
            { name: 'Tue', value: 2.6 },
            { name: 'Wed', value: 2.5 },
            { name: 'Thu', value: 2.4 },
            { name: 'Fri', value: 2.4 },
        ],
    },
    {
        label: "Automation Rate",
        value: "87.8%",
        description: "AI-handled interactions",
        icon: Zap,
        trend: "+11.5%",
        data: [
            { name: 'Mon', value: 82 },
            { name: 'Tue', value: 84 },
            { name: 'Wed', value: 86 },
            { name: 'Thu', value: 87 },
            { name: 'Fri', value: 88 },
        ],
    },
]

const dashboardViews = [
    {
        view: "Agent Leaderboards",
        description: "Rank agents by performance metrics, response times, and customer satisfaction scores",
        icon: Users,
    },
    {
        view: "Sentiment Heatmaps",
        description: "Visualize customer mood trends across time periods, channels, and interaction types",
        icon: TrendingUp,
    },
    {
        view: "Channel Comparison",
        description: "Side-by-side analysis of Voice, Messaging, and Email performance metrics",
        icon: BarChart3,
    },
    {
        view: "Volume Trends",
        description: "Track interaction volumes by hour, day, week, and month across all channels",
        icon: Activity,
    },
    {
        view: "Resolution Funnels",
        description: "Visualize customer journey from initial contact to issue resolution",
        icon: Target,
    },
    {
        view: "Custom Dashboards",
        description: "Build personalized views with drag-and-drop widgets and saved filter configurations",
        icon: Eye,
    },
]

const exportFormats = [
    { format: "CSV", description: "Comma-separated values for spreadsheet analysis", icon: FileText },
    { format: "XLSX", description: "Excel workbook with formatted sheets and charts", icon: FileText },
    { format: "JSON", description: "Structured data for custom integrations", icon: Code },
    { format: "PDF", description: "Print-ready reports with visualizations", icon: FileText },
]

const apiEndpoints = [
    {
        endpoint: "/api/v1/analytics/voice",
        description: "Retrieve voice call metrics and recordings",
        method: "GET",
    },
    {
        endpoint: "/api/v1/analytics/messaging",
        description: "Fetch messaging conversation data and statistics",
        method: "GET",
    },
    {
        endpoint: "/api/v1/analytics/email",
        description: "Access email processing metrics and classifications",
        method: "GET",
    },
    {
        endpoint: "/api/v1/analytics/overall",
        description: "Combined cross-channel performance summary",
        method: "GET",
    },
    {
        endpoint: "/api/v1/analytics/export",
        description: "Generate and download custom reports",
        method: "POST",
    },
    {
        endpoint: "/api/v1/analytics/agents",
        description: "Agent-specific performance and ranking data",
        method: "GET",
    },
]

// Mock data for bar charts
const weeklyVolumeData = [
    { day: "Mon", voice: 2340, messaging: 1890, email: 1120 },
    { day: "Tue", voice: 2580, messaging: 2140, email: 1350 },
    { day: "Wed", voice: 2910, messaging: 2450, email: 1580 },
    { day: "Thu", voice: 2670, messaging: 2280, email: 1420 },
    { day: "Fri", voice: 2450, messaging: 2010, email: 1290 },
    { day: "Sat", voice: 1820, messaging: 1560, email: 890 },
    { day: "Sun", voice: 1660, messaging: 1350, email: 750 },
]

const hourlyDistributionData = [
    { hour: "00:00", interactions: 320 },
    { hour: "03:00", interactions: 180 },
    { hour: "06:00", interactions: 450 },
    { hour: "09:00", interactions: 1240 },
    { hour: "12:00", interactions: 1680 },
    { hour: "15:00", interactions: 1520 },
    { hour: "18:00", interactions: 1350 },
    { hour: "21:00", interactions: 890 },
]

const agentPerformanceData = [
    { agent: "Aisha O.", interactions: 847, satisfaction: 4.8 },
    { agent: "Samuel K.", interactions: 756, satisfaction: 4.6 },
    { agent: "Fatima Y.", interactions: 692, satisfaction: 4.7 },
    { agent: "David M.", interactions: 634, satisfaction: 4.5 },
    { agent: "Chioma N.", interactions: 589, satisfaction: 4.6 },
]

export default function AnalyticsPage() {
    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h1 className="google-headline-medium">Analytics</h1>
                    <p className="google-body-medium text-muted-foreground">
                        Unified performance dashboard for all communication channels
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button className="h-11 rounded-sm px-6 text-white">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <Filter className="mr-2 h-4 w-4" />
                        Custom Filters
                    </Button>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <Calendar className="mr-2 h-4 w-4" />
                        Date Range
                    </Button>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <Code className="mr-2 h-4 w-4" />
                        API Docs
                    </Button>
                </div>
            </div>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground">Overall performance</div>
                    <div className="google-body-medium text-muted-foreground">
                        Unified metrics combining all communication channels
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {overallMetrics.map((metric) => (
                            <div
                                key={metric.label}
                                className="rounded-sm border border-input bg-metricCard p-4 transition-colors duration-200 hover:border-primary/60"
                            >
                                <div className="flex items-center justify-between">
                                    <metric.icon className="h-5 w-5 text-primary" />
                                    <Badge
                                        variant="outline"
                                        className={`rounded-full border-0 ${metric.trend.startsWith("+") || metric.trend.includes("spots")
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
                                <div className="mt-3">
                                    <ResponsiveContainer width="100%" height={100}>
                                        <BarChart data={metric.data}>
                                            <XAxis dataKey="name" hide />
                                            <YAxis hide />
                                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                    <CardHeader className="rounded-t-sm">
                        <div className="google-headline-small text-foreground">Weekly volume by channel</div>
                        <div className="google-body-medium text-muted-foreground">
                            Interaction trends across Voice, Messaging, and Email
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {weeklyVolumeData.map((data) => {
                                const total = data.voice + data.messaging + data.email
                                const voicePercent = (data.voice / total) * 100
                                const messagingPercent = (data.messaging / total) * 100
                                const emailPercent = (data.email / total) * 100

                                return (
                                    <div key={data.day} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="google-body-small text-foreground font-medium w-12">{data.day}</span>
                                            <span className="google-body-small text-muted-foreground text-xs">
                                                {total.toLocaleString()} total
                                            </span>
                                        </div>
                                        <div className="flex h-8 w-full overflow-hidden rounded-sm">
                                            <div
                                                className="bg-blue-500 transition-all duration-300 hover:bg-blue-600 flex items-center justify-center"
                                                style={{ width: `${voicePercent}%` }}
                                                title={`Voice: ${data.voice}`}
                                            >
                                                {voicePercent > 15 && (
                                                    <span className="text-xs font-medium text-white">{data.voice}</span>
                                                )}
                                            </div>
                                            <div
                                                className="bg-green-500 transition-all duration-300 hover:bg-green-600 flex items-center justify-center"
                                                style={{ width: `${messagingPercent}%` }}
                                                title={`Messaging: ${data.messaging}`}
                                            >
                                                {messagingPercent > 15 && (
                                                    <span className="text-xs font-medium text-white">{data.messaging}</span>
                                                )}
                                            </div>
                                            <div
                                                className="bg-purple-500 transition-all duration-300 hover:bg-purple-600 flex items-center justify-center"
                                                style={{ width: `${emailPercent}%` }}
                                                title={`Email: ${data.email}`}
                                            >
                                                {emailPercent > 15 && (
                                                    <span className="text-xs font-medium text-white">{data.email}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-4 pt-4 border-t border-input">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-sm bg-blue-500" />
                                <span className="google-body-small text-muted-foreground">Voice</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-sm bg-green-500" />
                                <span className="google-body-small text-muted-foreground">Messaging</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-sm bg-purple-500" />
                                <span className="google-body-small text-muted-foreground">Email</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                    <CardHeader className="rounded-t-sm">
                        <div className="google-headline-small text-foreground">Hourly interaction distribution</div>
                        <div className="google-body-medium text-muted-foreground">
                            Peak activity times across all channels
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {hourlyDistributionData.map((data) => {
                                const maxValue = Math.max(...hourlyDistributionData.map(d => d.interactions))
                                const widthPercent = (data.interactions / maxValue) * 100

                                return (
                                    <div key={data.hour} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="google-body-small text-foreground font-medium w-14">{data.hour}</span>
                                            <span className="google-body-small text-muted-foreground text-xs">
                                                {data.interactions.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="h-7 w-full bg-muted/40 rounded-sm overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 flex items-center px-2"
                                                style={{ width: `${widthPercent}%` }}
                                            >
                                                {widthPercent > 20 && (
                                                    <span className="text-xs font-medium text-white">
                                                        {data.interactions.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground">Agent performance comparison</div>
                    <div className="google-body-medium text-muted-foreground">
                        Total interactions and satisfaction scores by team member
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {agentPerformanceData.map((data, index) => {
                            const maxInteractions = Math.max(...agentPerformanceData.map(d => d.interactions))
                            const widthPercent = (data.interactions / maxInteractions) * 100
                            const satisfactionColor = data.satisfaction >= 4.7 ? 'text-green-600' : data.satisfaction >= 4.5 ? 'text-blue-600' : 'text-yellow-600'

                            return (
                                <div key={data.agent} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="google-body-small text-muted-foreground font-medium w-6">#{index + 1}</span>
                                            <span className="google-body-small text-foreground font-medium">{data.agent}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="google-body-small text-muted-foreground text-xs">
                                                {data.interactions} interactions
                                            </span>
                                            <Badge variant="outline" className={`rounded-full border-0 bg-muted/40 ${satisfactionColor}`}>
                                                ★ {data.satisfaction}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="h-8 w-full bg-muted/40 rounded-sm overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 flex items-center px-3"
                                            style={{ width: `${widthPercent}%` }}
                                        >
                                            {widthPercent > 25 && (
                                                <span className="text-xs font-medium text-white">
                                                    {data.interactions} interactions
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-input">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="google-body-small text-muted-foreground mb-1">Top Performer</div>
                                <div className="google-title-small text-foreground">Aisha O.</div>
                            </div>
                            <div>
                                <div className="google-body-small text-muted-foreground mb-1">Avg Interactions</div>
                                <div className="google-title-small text-foreground">704</div>
                            </div>
                            <div>
                                <div className="google-body-small text-muted-foreground mb-1">Avg Satisfaction</div>
                                <div className="google-title-small text-foreground">4.6/5</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground">Metrics by channel</div>
                    <div className="google-body-medium text-muted-foreground">
                        Detailed performance tracking for each communication channel
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        {channelMetrics.map((channel) => (
                            <div
                                key={channel.channel}
                                className="rounded-sm border border-input bg-muted/40 p-6 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <channel.icon className="h-5 w-5 text-primary" />
                                    <div className="google-headline-small text-foreground">{channel.channel}</div>
                                </div>

                                <div className="grid gap-4 mb-4 md:grid-cols-2 lg:grid-cols-4">
                                    {channel.metrics.map((metric) => (
                                        <div
                                            key={metric.name}
                                            className="rounded-sm border border-input bg-background p-3"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="google-body-small text-muted-foreground">{metric.name}</div>
                                                <Badge
                                                    variant="outline"
                                                    className={`rounded-full border-0 text-xs ${metric.trend.startsWith("+")
                                                            ? "bg-green-500/20 text-green-600"
                                                            : metric.trend.startsWith("-")
                                                                ? "bg-red-500/20 text-red-600"
                                                                : "bg-blue-500/20 text-blue-600"
                                                        }`}
                                                >
                                                    {metric.trend}
                                                </Badge>
                                            </div>
                                            <div className="google-title-small text-foreground">{metric.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                    <CardHeader className="rounded-t-sm">
                        <div className="google-headline-small text-foreground">Data export formats</div>
                        <div className="google-body-medium text-muted-foreground">
                            Download analytics in your preferred format
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {exportFormats.map((format) => (
                                <div
                                    key={format.format}
                                    className="rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                                >
                                    <div className="flex items-start gap-3">
                                        <format.icon className="h-5 w-5 text-primary mt-0.5" />
                                        <div className="flex-1">
                                            <div className="google-title-small text-foreground">{format.format}</div>
                                            <p className="google-body-small text-muted-foreground mt-1">{format.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                    <CardHeader className="rounded-t-sm">
                        <div className="google-headline-small text-foreground">API access</div>
                        <div className="google-body-medium text-muted-foreground">
                            Programmatic access to analytics data
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="google-body-small text-muted-foreground">
                                All analytics metrics are accessible via RESTful API endpoints. Authenticate using your API key and retrieve data in JSON format for custom integrations, dashboards, and automation workflows.
                            </p>
                            <div className="grid gap-2">
                                {apiEndpoints.slice(0, 4).map((endpoint) => (
                                    <div
                                        key={endpoint.endpoint}
                                        className="rounded-sm border border-input bg-muted/40 p-3 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="rounded-full border-input bg-background text-xs">
                                                {endpoint.method}
                                            </Badge>
                                            <code className="google-body-small text-primary">{endpoint.endpoint}</code>
                                        </div>
                                        <p className="google-body-small text-muted-foreground text-xs">{endpoint.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground">Additional API endpoints</div>
                    <div className="google-body-medium text-muted-foreground">
                        Extended functionality for advanced use cases
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                        {apiEndpoints.slice(4).map((endpoint) => (
                            <div
                                key={endpoint.endpoint}
                                className="rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="rounded-full border-input bg-background text-xs">
                                        {endpoint.method}
                                    </Badge>
                                    <code className="google-body-small text-primary">{endpoint.endpoint}</code>
                                </div>
                                <p className="google-body-small text-muted-foreground">{endpoint.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-sm border border-input bg-muted/40 p-4">
                        <div className="google-title-small text-foreground mb-3">Authentication</div>
                        <div className="grid gap-2">
                            <div className="flex items-start gap-3">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                                <span className="google-body-small text-muted-foreground">
                                    All requests require an API key in the <code className="text-primary">Authorization</code> header
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                                <span className="google-body-small text-muted-foreground">
                                    Generate API keys from Dashboard → Settings → API Management
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                                <span className="google-body-small text-muted-foreground">
                                    Rate limits: 1,000 requests per hour for standard plans, 10,000 for enterprise
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
