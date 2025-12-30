"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    Shield,
    Download,
    Eye,
    FileText,
    Lock,
    Key,
    CheckCircle,
    Calendar,
    User,
    Activity,
    Globe,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useSecuritySettings } from "@/hooks/use-security-settings"
import { useAuditLogs } from "@/hooks/use-audit-logs"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { format } from "date-fns"
import { MFAEnrollment } from "@/components/mfa-enrollment"
import { SessionsModal } from "@/components/sessions-modal"
import * as XLSX from "xlsx"

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

export default function SecurityPage() {
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [sessionsModalOpen, setSessionsModalOpen] = useState(false)
    const { settings, isLoading: settingsLoading, updateSettings } = useSecuritySettings()
    const { logs, pagination, isLoading: logsLoading } = useAuditLogs(page, limit)
    const { toast } = useToast()

    const formatIPAddress = (ip: string | null) => {
        if (!ip) return "Not recorded"
        if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") {
            return "Local"
        }
        return ip
    }

    const handleToggle2FA = async (checked: boolean) => {
        try {
            await updateSettings({ two_factor_enabled: checked })
            toast({
                title: "Success",
                description: `Two-Factor Authentication ${checked ? 'enabled' : 'disabled'}`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update 2FA settings",
                variant: "destructive",
            })
        }
    }

    const handleAuthMethodChange = async (value: string) => {
        // Map selection to array with consistent naming
        let methods: string[] = []
        if (value === 'all') methods = ['password', 'email_otp', 'sso', 'totp']
        else if (value === 'otp-app') methods = ['email_otp', 'totp']
        else if (value === 'sso-only') methods = ['sso']
        else if (value === 'otp-only') methods = ['email_otp']

        try {
            await updateSettings({ allowed_auth_methods: methods })
            toast({
                title: "Success",
                description: "Authentication methods updated",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update authentication methods",
                variant: "destructive",
            })
        }
    }

    const exportToCSV = () => {
        if (logs.length === 0) {
            toast({
                title: "No data to export",
                description: "There are no audit logs to export",
                variant: "destructive",
            })
            return
        }

        const headers = ["Timestamp", "User", "Action", "Resource", "IP Address"]
        const rows = logs.map(log => [
            log.created_at ? format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss") : "N/A",
            log.actor_name || "Unknown",
            log.action || "N/A",
            log.resource || "System",
            formatIPAddress(log.ip_address)
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
            title: "Export successful",
            description: `Exported ${logs.length} audit log entries to CSV`,
        })
    }

    const exportToXLSX = () => {
        if (logs.length === 0) {
            toast({
                title: "No data to export",
                description: "There are no audit logs to export",
                variant: "destructive",
            })
            return
        }

        const data = logs.map(log => ({
            Timestamp: log.created_at ? format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss") : "N/A",
            User: log.actor_name || "Unknown",
            Action: log.action || "N/A",
            Resource: log.resource || "System",
            "IP Address": formatIPAddress(log.ip_address),
        }))

        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs")

        // Auto-size columns
        const maxWidth = 50
        const colWidths = Object.keys(data[0] || {}).map(key => {
            const maxLen = Math.max(
                key.length,
                ...data.map(row => String(row[key as keyof typeof row] || "").length)
            )
            return { wch: Math.min(maxLen + 2, maxWidth) }
        })
        worksheet["!cols"] = colWidths

        XLSX.writeFile(workbook, `audit-logs-${format(new Date(), "yyyy-MM-dd")}.xlsx`)

        toast({
            title: "Export successful",
            description: `Exported ${logs.length} audit log entries to Excel`,
        })
    }

    if (settingsLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h1 className="google-headline-medium">Security & Compliance</h1>
                    <p className="google-body-medium text-muted-foreground">
                        Keep your communications protected with enterprise-grade security
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <Button className="h-11 rounded-sm px-6 text-white w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Compliance Docs
                    </Button>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white w-full sm:w-auto">
                        <FileText className="mr-2 h-4 w-4" />
                        Security Report
                    </Button>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white w-full sm:w-auto">
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
                                        <Switch 
                                            checked={settings?.two_factor_enabled} 
                                            onCheckedChange={handleToggle2FA}
                                        />
                                        <span className="google-body-small text-foreground">
                                            {settings?.two_factor_enabled ? 'Enforced' : 'Optional'} for all users
                                        </span>
                                    </div>
                                </div>
                                    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                                    <MFAEnrollment />
                                    {/* {settings?.two_factor_enabled && (
                                        <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-600">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Policy Active
                                        </Badge>
                                    )} */}
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
                                    <Select onValueChange={handleAuthMethodChange} defaultValue="all">
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
                                    {settings?.allowed_auth_methods?.length || 0} methods enabled
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
                                        Active
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                                        onClick={() => setSessionsModalOpen(true)}
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
                                {/* <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-600">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Secure
                                </Badge> */}
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
                                    {/* <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-600">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Compliant
                                    </Badge> */}
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
                                className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary w-full sm:w-auto"
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
                    <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="google-headline-small text-foreground flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                Audit logs
                            </div>
                            <div className="google-body-medium text-muted-foreground mt-1">
                                Track all security-related actions and user activity
                            </div>
                        </div>
                            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                            <Select defaultValue="all-users">
                                    <SelectTrigger className="w-full sm:w-[160px] rounded-sm border-input">
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
                                <SelectTrigger className="w-full sm:w-[140px] rounded-sm border-input">
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
                                <SelectTrigger className="w-full sm:w-[160px] rounded-sm border-input">
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
                    <div className="rounded-sm bg-muted/40">
                        {logsLoading ? (
                            <div className="p-4 text-center">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="p-4  text-center text-muted-foreground">
                                No audit logs found
                            </div>
                        ) : (
                            <div className="">
                                {logs.map((log) => (
                                    <div key={log.id} className="border border-input p-4 my-1 rounded-lg transition-colors hover:bg-muted/40">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="google-body-small text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" />
                                                    {log.created_at ? format(new Date(log.created_at), "yyyy-MM-dd HH:mm") : "N/A"}
                                                </div>
                                                <div className="google-body-small text-foreground flex items-center gap-2 min-w-0">
                                                    <User className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">{log.actor_name || "Unknown"}</span>
                                                </div>
                                            </div>

                                            <div className="min-w-0">
                                                <div className="google-body-small text-muted-foreground">Action</div>
                                                <div className="google-body-small text-foreground break-words">
                                                    {log.action || "N/A"}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <div className="google-body-small text-muted-foreground">Resource</div>
                                                    <Badge
                                                        variant="outline"
                                                        className="mt-1 max-w-full rounded-full border-input bg-muted/40 text-muted-foreground"
                                                    >
                                                        <span className="truncate">{log.resource || "System"}</span>
                                                    </Badge>
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="google-body-small text-muted-foreground">IP Address</div>
                                                    <code className="mt-1 block text-xs break-all text-muted-foreground">
                                                        {formatIPAddress(log.ip_address)}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-input bg-muted/40 p-4">
                        <div className="flex items-center gap-4">
                            <div className="google-body-small text-muted-foreground">
                                Showing {logs.length} audit log entries
                                {pagination && ` (Page ${pagination.page} of ${pagination.totalPages})`}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || logsLoading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!pagination || page >= pagination.totalPages || logsLoading}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                                onClick={exportToCSV}
                                disabled={logs.length === 0}
                            >
                                <FileText className="mr-2 h-3 w-3" />
                                Export CSV
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-sm border-input bg-transparent hover:border-primary hover:bg-primary/10 hover:text-primary"
                                onClick={exportToXLSX}
                                disabled={logs.length === 0}
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

            <SessionsModal isOpen={sessionsModalOpen} onOpenChange={setSessionsModalOpen} />
        </div>
    )
}