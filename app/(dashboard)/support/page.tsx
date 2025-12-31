"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    HelpCircle,
    MessageCircle,
    Headphones,
    BookOpen,
    Lightbulb,
    Wrench,
    Video,
    FileQuestion,
    Mail,
    Code,
    Users,
    Activity,
    Phone,
    CheckCircle,
    Clock,
    ExternalLink,
} from "lucide-react"

const supportTypes = [
    {
        type: "AI Support Agent",
        icon: MessageCircle,
        availability: "24/7 instant responses",
        description: "Get immediate answers from our AI assistant trained on CoreComm documentation",
        action: "Talk to Mia",
        status: "available",
        color: "bg-primary/20 text-primary",
    },
    {
        type: "Human Support Agent",
        icon: Headphones,
        availability: "Weekdays 9AM-6PM WAT + On-Demand Escalation",
        description: "Connect with expert support specialists for complex issues and personalized guidance",
        action: "Request Human Help",
        status: "available",
        color: "bg-blue-500/20 text-blue-600",
    },
]

const knowledgeResources = [
    {
        title: "Getting Started Tutorials",
        description: "Step-by-step guides for setting up your first agents, channels, and workflows",
        icon: BookOpen,
        articles: 24,
        color: "bg-purple-500/20 text-purple-600",
    },
    {
        title: "Best Practices & Use Cases",
        description: "Real-world examples and optimization strategies for different industries",
        icon: Lightbulb,
        articles: 18,
        color: "bg-yellow-500/20 text-yellow-600",
    },
    {
        title: "API & Integration Guides",
        description: "Developer documentation, code samples, and integration walkthroughs",
        icon: Wrench,
        articles: 32,
        color: "bg-orange-500/20 text-orange-600",
    },
    {
        title: "Video Lessons & Walkthroughs",
        description: "Visual tutorials covering platform features and advanced configurations",
        icon: Video,
        articles: 15,
        color: "bg-red-500/20 text-red-600",
    },
    {
        title: "Frequently Asked Questions",
        description: "Quick answers to common questions about billing, security, and features",
        icon: FileQuestion,
        articles: 47,
        color: "bg-blue-500/20 text-blue-600",
    },
    {
        title: "Troubleshooting Guides",
        description: "Solutions to common issues with integrations, routing, and performance",
        icon: Wrench,
        articles: 28,
        color: "bg-teal-500/20 text-teal-600",
    },
]

const contactMethods = [
    {
        method: "Email Support",
        detail: "support@corecomm.ai",
        description: "Response within 24 hours (Priority support: 4 hours)",
        icon: Mail,
        action: "Send Email",
    },
    {
        method: "Developer Documentation",
        detail: "developers.corecomm.ai",
        description: "API reference, SDKs, webhooks, and integration guides",
        icon: Code,
        action: "Open Docs",
    },
    {
        method: "Community Forum",
        detail: "Connect with other CoreComm users",
        description: "Share tips, ask questions, and learn from the community",
        icon: Users,
        action: "Join Community",
    },
]

const systemStatus = [
    {
        service: "API Gateway",
        status: "operational",
        icon: Activity,
    },
    {
        service: "Voice Engine",
        status: "operational",
        icon: Phone,
    },
    {
        service: "Email Processing",
        status: "operational",
        icon: Mail,
    },
    {
        service: "Messaging Gateway",
        status: "operational",
        icon: MessageCircle,
    },
    {
        service: "Integrations Hub",
        status: "operational",
        icon: Wrench,
    },
    {
        service: "Analytics Platform",
        status: "operational",
        icon: Activity,
    },
]

const quickLinks = [
    "How to create your first AI agent",
    "Setting up WhatsApp Business integration",
    "Understanding voice routing rules",
    "Managing team permissions and roles",
    "Configuring email automation",
    "Exporting analytics reports",
    "API authentication guide",
    "Troubleshooting integration errors",
]

export default function SupportPage() {
    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h1 className="google-headline-medium">Help & Support Center</h1>
                    <p className="google-body-medium text-muted-foreground">
                        Get assistance instantly — powered by AI and real experts
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button className="h-11 rounded-sm px-6 text-white">
                        <Phone className="mr-2 h-4 w-4" />
                        Talk to Mia
                    </Button>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Knowledge Hub
                    </Button>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <Activity className="mr-2 h-4 w-4" />
                        System Status
                    </Button>
                </div>
            </div>
            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground flex items-center gap-2">
                        <Headphones className="h-4 w-4 text-primary" />
                        Live support
                    </div>
                    <div className="google-body-medium text-muted-foreground">
                        Connect with AI or human support specialists
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 lg:grid-cols-2">
                        {supportTypes.map((support) => (
                            <div
                                key={support.type}
                                className="rounded-sm border border-input bg-muted/40 p-5 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`rounded-full p-3 ${support.color}`}>
                                        <support.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="google-headline-small text-foreground">{support.type}</div>

                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="google-body-small text-muted-foreground">{support.availability}</span>
                                        </div>

                                        <p className="google-body-small text-muted-foreground">{support.description}</p>

                                        <div className="flex items-center gap-2 pt-2">
                                            <Button
                                                className="rounded-sm text-white"
                                                size="sm"
                                            >
                                                {support.action}
                                            </Button>
                                            {/* <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-600">
                                                
                                                Available
                                            </Badge> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                    <CardHeader className="rounded-t-sm">
                        <div className="google-headline-small text-foreground">Contact support</div>
                        <div className="google-body-medium text-muted-foreground">
                            Additional channels to reach our team
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {contactMethods.map((method) => (
                                <div
                                    key={method.method}
                                    className="rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <method.icon className="h-5 w-5 text-primary mt-0.5" />
                                        <div className="flex-1">
                                            <div className="google-title-small text-foreground mb-1">{method.method}</div>
                                            <div className="google-body-small text-primary mb-1">{method.detail}</div>
                                            <p className="google-body-small text-muted-foreground">{method.description}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                                    >
                                        <ExternalLink className="mr-2 h-3 w-3" />
                                        {method.action}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                    <CardHeader className="rounded-t-sm">
                        <div className="google-headline-small text-foreground">Quick links</div>
                        <div className="google-body-medium text-muted-foreground">
                            Popular help articles and guides
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            {quickLinks.map((link) => (
                                <button
                                    key={link}
                                    className="flex items-start gap-3 rounded-sm border border-input bg-muted/40 p-3 text-left transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                                >
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span className="google-body-small text-foreground hover:text-primary transition-colors">
                                        {link}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>



            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Knowledge hub
                    </div>
                    <div className="google-body-medium text-muted-foreground">
                        Self-service resources for learning and troubleshooting
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {knowledgeResources.map((resource) => (
                            <div
                                key={resource.title}
                                className="rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted cursor-pointer"
                            >
                                <div className={`inline-flex rounded-full p-2 mb-3 ${resource.color}`}>
                                    <resource.icon className="h-5 w-5" />
                                </div>
                                <div className="google-title-small text-foreground mb-2">{resource.title}</div>
                                <p className="google-body-small text-muted-foreground mb-3">{resource.description}</p>
                                <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                    {resource.articles} articles
                                </Badge>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 rounded-sm border border-input bg-muted/40 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="google-title-small text-foreground mb-1">Access full knowledge hub</div>
                                <p className="google-body-small text-muted-foreground">
                                    Browse all resources, search articles, and bookmark favorites
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                            >
                                <BookOpen className="mr-2 h-4 w-4" />
                                Open Knowledge Hub
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        System status
                    </div>
                    <div className="google-body-medium text-muted-foreground">
                        Real-time platform health and performance monitoring
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {systemStatus.map((service) => (
                            <div
                                key={service.service}
                                className="rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <service.icon className="h-5 w-5 text-primary" />
                                    <div className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        {/* <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-600 text-xs">
                                            Operational
                                        </Badge> */}
                                    </div>
                                </div>
                                <div className="google-title-small text-foreground mb-3">{service.service}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 rounded-sm border border-input bg-muted/40 p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="google-title-small text-foreground mb-1">All systems operational</div>
                                <p className="google-body-small text-muted-foreground">
                                    No incidents or maintenance scheduled. Last updated: 2 minutes ago
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
