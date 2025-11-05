"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    Shield,
    Download,
    Eye,
    Filter,
    FileText,
    Lock,
    Key,
    CheckCircle,
    AlertTriangle,
    Calendar,
    User,
    Activity,
    Globe,
    Settings,
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const authenticationControls = [
    {
        setting: "Two-Factor Authentication (2FA)",
        description: "Require secondary verification for all users",
        control: "toggle",
        enabled: true,
    },
    {
        setting: "Allowed Authentication Methods",
        description: "Email OTP, Authenticator App, SSO",
        control: "dropdown",
        enabled: true,
    },
    {
        setting: "Active User Sessions",
        description: "View and revoke session tokens",
        control: "button",
        enabled: true,
    },
]

const dataEncryption = [
    {
        dataType: "Voice Recordings",
        standard: "AES-256",
        location: "At-Rest + In-Transit",
        status: "secure",
        icon: Lock,
    },
    {
        dataType: "Messages",
        standard: "TLS 1.3",
        location: "End-to-End Optional",
        status: "secure",
        icon: Lock,
    },
    {
        dataType: "Attachments (PDF, DOCX, Images)",
        standard: "AES-256",
        location: "At-Rest",
        status: "secure",
        icon: Lock,
    },
]

const complianceStandards = [
    {
        standard: "GDPR",
        fullName: "General Data Protection Regulation",
        region: "European Union",
        status: "compliant",
        icon: Globe,
    },
    {
        standard: "NDPR",
        fullName: "Nigeria Data Protection Regulation",
        region: "Nigeria",
        status: "compliant",
        icon: Globe,
    },
    {
        standard: "CCPA",
        fullName: "California Consumer Privacy Act",
        region: "California, USA",
        status: "compliant",
        icon: Globe,
    },
]

const auditLogs = [
    {
        id: "1",
        timestamp: "2025-11-04 10:22",
        user: "Aisha O. (Admin)",
        action: "Updated agent permissions",
        channel: "Messaging",
        ipAddress: "41.190.22.16",
    },
    {
        id: "2",
        timestamp: "2025-11-04 09:45",
        user: "Samuel K. (Support Lead)",
        action: "Exported analytics report",
        channel: "Analytics",
        ipAddress: "102.89.45.12",
    },
    {
        id: "3",
        timestamp: "2025-11-04 09:12",
        user: "Idris T. (Developer)",
        action: "Generated new API key",
        channel: "Integrations",
        ipAddress: "197.210.70.34",
    },
    {
        id: "4",
        timestamp: "2025-11-04 08:30",
        user: "Fatima Y. (Agent)",
        action: "Accessed customer conversation",
        channel: "WhatsApp",
        ipAddress: "105.112.88.21",
    },
    {
        id: "5",
        timestamp: "2025-11-04 07:58",
        user: "Aisha O. (Admin)",
        action: "Modified routing rules",
        channel: "Voice",
        ipAddress: "41.190.22.16",
    },
    {
        id: "6",
        timestamp: "2025-11-03 18:43",
        user: "David M. (Support Lead)",
        action: "Reviewed email classifications",
        channel: "Email",
        ipAddress: "156.234.12.89",
    },
]

const securityFeatures = [
    "Enterprise-grade encryption for all data at rest and in transit",
    "Multi-factor authentication with SSO integration support",
    "Session management with automatic timeout and revocation",
    "IP whitelisting and geo-blocking capabilities",
    "Regular security audits and penetration testing",
    "SOC 2 Type II certified infrastructure",
    "Automated threat detection and monitoring",
    "Data residency options for regional compliance",
]

export default function SecurityPage() {
    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h1 className="google-headline-medium">Security & Compliance</h1>
                    <p className="google-body-medium text-muted-foreground">
                        Keep your communications protected with enterprise-grade security
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button className="h-11 rounded-sm px-6 text-white">
                        <Download className="mr-2 h-4 w-4" />
                        Compliance Docs
                    </Button>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <FileText className="mr-2 h-4 w-4" />
                        Security Report
                    </Button>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                    </Button>
                </div>
            </div>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground flex items-center gap-2">
                        <Key className="h-4 w-4 text-primary" />
                        Authentication controls
                    </div>
                    <div className="google-body-medium text-muted-foreground">
                        Manage user verification and access security settings
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {/* Two-Factor Authentication */}
                        <div className="rounded-sm border border-input bg-muted/40 p-5 transition-colors duration-200 hover:border-primary/60 hover:bg-muted">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex-1">
                                    <div className="google-title-small text-foreground mb-2">Two-Factor Authentication (2FA)</div>
                                    <p className="google-body-small text-muted-foreground mb-3">
                                        Require secondary verification for all users
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <Switch defaultChecked />
                                        <span className="google-body-small text-foreground">Enabled for all users</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                                    >
                                        Enforce for All
                                    </Button>
                                    <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-600">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Active
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Allowed Authentication Methods */}
                        <div className="rounded-sm border border-input bg-muted/40 p-5 transition-colors duration-200 hover:border-primary/60 hover:bg-muted">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex-1">
                                    <div className="google-title-small text-foreground mb-2">Allowed Authentication Methods</div>
                                    <p className="google-body-small text-muted-foreground mb-3">
                                        Select verification methods available to users
                                    </p>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-full lg:w-[280px] rounded-sm border-input">
                                            <SelectValue placeholder="Select methods" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Methods (OTP + App + SSO)</SelectItem>
                                            <SelectItem value="otp-app">Email OTP + Authenticator App</SelectItem>
                                            <SelectItem value="sso-only">SSO Only</SelectItem>
                                            <SelectItem value="otp-only">Email OTP Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                    3 methods enabled
                                </Badge>
                            </div>
                        </div>

                        {/* Active User Sessions */}
                        <div className="rounded-sm border border-input bg-muted/40 p-5 transition-colors duration-200 hover:border-primary/60 hover:bg-muted">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex-1">
                                    <div className="google-title-small text-foreground mb-2">Active User Sessions</div>
                                    <p className="google-body-small text-muted-foreground">
                                        View and revoke session tokens for security management
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                        12 active sessions
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                                    >
                                        <Eye className="mr-2 h-3 w-3" />
                                        View Sessions
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        Data encryption
                    </div>
                    <div className="google-body-medium text-muted-foreground">
                        Encryption standards for all communication data types
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {dataEncryption.map((item) => (
                            <div
                                key={item.dataType}
                                className="flex flex-col gap-3 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted lg:flex-row lg:items-center lg:justify-between"
                            >
                                <div className="flex flex-1 items-center gap-3">
                                    <item.icon className="h-5 w-5 text-primary" />
                                    <div className="flex-1">
                                        <div className="google-title-small text-foreground">{item.dataType}</div>
                                        <div className="google-body-small text-muted-foreground mt-1">
                                            {item.standard} • {item.location}
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-600">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Secure
                                </Badge>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 rounded-sm border border-input bg-muted/40 p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="google-title-small text-foreground mb-1">All encryption protocols active</div>
                                <p className="google-body-small text-muted-foreground">
                                    Your data is protected using industry-standard encryption at rest and in transit. Voice recordings and attachments use AES-256 encryption, while messages benefit from TLS 1.3 with optional end-to-end encryption.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Compliance
                    </div>
                    <div className="google-body-medium text-muted-foreground">
                        Regulatory compliance status across global jurisdictions
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {complianceStandards.map((item) => (
                            <div
                                key={item.standard}
                                className="rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <item.icon className="h-5 w-5 text-primary" />
                                    <div className="flex-1">
                                        <div className="google-title-small text-foreground">{item.standard}</div>
                                        <div className="google-body-small text-muted-foreground mt-1">{item.fullName}</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="google-body-small text-muted-foreground">{item.region}</span>
                                    <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-600">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Compliant
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-sm border border-input bg-muted/40 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="google-title-small text-foreground mb-1">Compliance documentation</div>
                                <p className="google-body-small text-muted-foreground">
                                    Download detailed compliance reports, audit certificates, and policy documents
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download All Docs
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="google-headline-small text-foreground flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                Audit logs
                            </div>
                            <div className="google-body-medium text-muted-foreground mt-1">
                                Track all security-related actions and user activity
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select defaultValue="all-users">
                                <SelectTrigger className="w-[160px] rounded-sm border-input">
                                    <SelectValue placeholder="Filter by user" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-users">All Users</SelectItem>
                                    <SelectItem value="admins">Admins Only</SelectItem>
                                    <SelectItem value="leads">Support Leads</SelectItem>
                                    <SelectItem value="agents">Agents</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select defaultValue="7-days">
                                <SelectTrigger className="w-[140px] rounded-sm border-input">
                                    <SelectValue placeholder="Date range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="7-days">Last 7 Days</SelectItem>
                                    <SelectItem value="30-days">Last 30 Days</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select defaultValue="all-actions">
                                <SelectTrigger className="w-[160px] rounded-sm border-input">
                                    <SelectValue placeholder="Action type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-actions">All Actions</SelectItem>
                                    <SelectItem value="permissions">Permissions</SelectItem>
                                    <SelectItem value="api">API Access</SelectItem>
                                    <SelectItem value="config">Configuration</SelectItem>
                                    <SelectItem value="data">Data Access</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-input">
                                    <th className="google-title-small text-foreground text-left p-3">Timestamp</th>
                                    <th className="google-title-small text-foreground text-left p-3">User</th>
                                    <th className="google-title-small text-foreground text-left p-3">Action</th>
                                    <th className="google-title-small text-foreground text-left p-3">Channel</th>
                                    <th className="google-title-small text-foreground text-left p-3">IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="border-b border-input transition-colors hover:bg-muted/40"
                                    >
                                        <td className="google-body-small text-muted-foreground p-3">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                {log.timestamp}
                                            </div>
                                        </td>
                                        <td className="google-body-small text-foreground p-3">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3" />
                                                {log.user}
                                            </div>
                                        </td>
                                        <td className="google-body-small text-foreground p-3">{log.action}</td>
                                        <td className="p-3">
                                            <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                                {log.channel}
                                            </Badge>
                                        </td>
                                        <td className="google-body-small text-muted-foreground p-3">
                                            <code className="text-xs">{log.ipAddress}</code>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-input bg-muted/40 p-4">
                        <div className="google-body-small text-muted-foreground">
                            Showing 6 of 1,247 audit log entries
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                            >
                                <FileText className="mr-2 h-3 w-3" />
                                Export CSV
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                            >
                                <FileText className="mr-2 h-3 w-3" />
                                Export XLSX
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                            >
                                <Settings className="mr-2 h-3 w-3" />
                                API Endpoint
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
