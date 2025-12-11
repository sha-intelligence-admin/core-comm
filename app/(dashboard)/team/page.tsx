"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddTeamMemberModal } from "@/components/add-team-member-modal"
import { Badge } from "@/components/ui/badge"
import { useTeamMembers } from "@/hooks/use-team-members"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
    Users,
    Plus,
    Settings,
    Shield,
    UserCog,
    Headphones,
    Code,
    MoreVertical,
    Mail,
    CheckCircle,
    Globe,
    MapPin,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const roleTypes = [
    {
        role: "Admin",
        icon: Shield,
        permissions: "Full access to all channels, agents, analytics, billing, and system settings",
        useCase: "System owners, operations managers, platform administrators",
        color: "bg-purple-500/20 text-purple-600",
    },
    {
        role: "Support Lead",
        icon: UserCog,
        permissions: "Manage Voice & Messaging Agents, edit routing rules, review analytics, escalate cases",
        useCase: "Customer support team managers or supervisors",
        color: "bg-blue-500/20 text-blue-600",
    },
    {
        role: "Agent",
        icon: Headphones,
        permissions: "Handle conversations only on assigned channels (Voice, Messaging, Email). No system configuration access",
        useCase: "Call center staff, support representatives, chat operators",
        color: "bg-green-500/20 text-green-600",
    },
    {
        role: "Developer",
        icon: Code,
        permissions: "Access to API Keys, Webhooks, Integrations, Logs. No access to customer messages unless granted",
        useCase: "Engineering, automation workflows, custom integrations",
        color: "bg-orange-500/20 text-orange-600",
    },
]

const assignmentSteps = [
    {
        step: "Navigate to Team",
        detail: "Go to Dashboard → Team → Manage Roles",
    },
    {
        step: "Add team member",
        detail: "Invite by email or authenticate via SSO (Single Sign-On)",
    },
    {
        step: "Assign a role",
        detail: "Select Admin, Support Lead, Agent, or Developer based on responsibilities",
    },
    {
        step: "Configure access limits",
        detail: "Optionally restrict to specific channels (Voice/Messaging/Email), agents (AI or Human), or regions/departments",
    },
    {
        step: "Save and activate",
        detail: "Changes take effect instantly — team member receives notification and access credentials",
    },
]

const bestPractices = [
    "Assign Admin roles to only a small, trusted group",
    "Use Developer roles for integration tasks instead of Admin",
    "Support Leads should monitor agent performance through the Analytics dashboard",
    "Agents should only be assigned the channels they actively manage",
    "Regularly audit team permissions and remove inactive users",
    "Enable two-factor authentication (2FA) for Admin and Support Lead roles",
    "Use SSO integration for enterprise teams to centralize access control",
]

export default function TeamPage() {
    const { members, loading, error, deleteMember, resendInvite } = useTeamMembers()
    const [resendingId, setResendingId] = useState<string | null>(null)

    const handleResendInvite = async (memberId: string, email: string) => {
        setResendingId(memberId)
        const result = await resendInvite(email)
        setResendingId(null)
        
        if (result.inviteLink) {
            // Show alert with link
            alert(`Invitation resent! Link: ${result.inviteLink}`)
        } else if (result.success) {
            alert('Invitation resent successfully!')
        } else {
            alert('Failed to resend invitation')
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-500/20 text-purple-600'
            case 'manager':
                return 'bg-blue-500/20 text-blue-600'
            case 'agent':
                return 'bg-green-500/20 text-green-600'
            case 'developer':
                return 'bg-orange-500/20 text-orange-600'
            case 'viewer':
                return 'bg-gray-500/20 text-gray-600'
            default:
                return 'bg-gray-500/20 text-gray-600'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/20 text-green-600'
            case 'inactive':
                return 'bg-gray-500/20 text-gray-600'
            case 'invited':
                return 'bg-blue-500/20 text-blue-600'
            case 'suspended':
                return 'bg-red-500/20 text-red-600'
            default:
                return 'bg-gray-500/20 text-gray-600'
        }
    }

    const handleDeleteMember = async (id: string) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            await deleteMember(id)
        }
    }

    const getTimeAgo = (dateString?: string) => {
        if (!dateString) return 'Never'
        const date = new Date(dateString)
        const now = new Date()
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
        
        if (seconds < 60) return 'Just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
        return `${Math.floor(seconds / 86400)} days ago`
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
                <p className="text-destructive">Error loading team members: {error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
    }
    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h1 className="google-headline-medium">Team & Roles</h1>
                    <p className="google-body-medium text-muted-foreground">
                        Manage team members, permissions, and role-based access control
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <AddTeamMemberModal>
                        <Button className="h-11 rounded-sm px-6 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Team Member
                        </Button>
                    </AddTeamMemberModal>
                    <AddTeamMemberModal>
                        <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                            <Mail className="mr-2 h-4 w-4" />
                            Invite by Email
                        </Button>
                    </AddTeamMemberModal>
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <Settings className="mr-2 h-4 w-4" />
                        Role Settings
                    </Button>
                </div>
            </div>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground">Team members</div>
                    <div className="google-body-medium text-muted-foreground">
                        Active users and their role assignments
                    </div>
                </CardHeader>
                <CardContent>
                    {members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="google-title-medium text-foreground mb-2">No team members yet</h3>
                            <p className="google-body-medium text-muted-foreground mb-4">
                                Add your first team member to start collaborating
                            </p>
                            <AddTeamMemberModal>
                                <Button className="rounded-sm text-white">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Team Member
                                </Button>
                            </AddTeamMemberModal>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex gap-4 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted flex-row items-center justify-between"
                                >
                                    <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                                                <span className="google-title-small text-primary">
                                                    {member.full_name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="google-title-small text-foreground">{member.full_name}</div>
                                                <div className="google-body-small text-muted-foreground mt-1">{member.email}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className={`rounded-full border-0 ${getRoleColor(member.role)}`}>
                                                {member.role}
                                            </Badge>
                                            {member.department && (
                                                <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                                    {member.department}
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className={`rounded-full border-0 ${getStatusColor(member.status)}`}>
                                                {member.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="google-body-small text-muted-foreground">
                                            {getTimeAgo(member.last_active_at)}
                                        </span>
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
                                                    Edit Permissions
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                                                    Change Role
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                                                    View Activity Log
                                                </DropdownMenuItem>
                                                {member.status === 'invited' && (
                                                    <DropdownMenuItem 
                                                        className="hover:bg-primary/10 hover:text-primary"
                                                        onClick={() => handleResendInvite(member.id, member.email)}
                                                        disabled={resendingId === member.id}
                                                    >
                                                        {resendingId === member.id ? 'Resending...' : 'Resend Invitation'}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem 
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleDeleteMember(member.id)}
                                                >
                                                    Remove from Team
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

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground">Role types & permissions</div>
                    <div className="google-body-medium text-muted-foreground">
                        Predefined roles with specific access levels and capabilities
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {roleTypes.map((roleType) => (
                            <div
                                key={roleType.role}
                                className="rounded-sm border border-input bg-muted/40 p-5 transition-colors duration-200 hover:border-primary/60 hover:bg-muted"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`rounded-full p-3 ${roleType.color}`}>
                                        <roleType.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="google-headline-small text-foreground">{roleType.role}</div>

                                        <div>
                                            <div className="google-body-small text-foreground font-medium mb-1">Permissions</div>
                                            <p className="google-body-small text-muted-foreground">{roleType.permissions}</p>
                                        </div>

                                        <div>
                                            <div className="google-body-small text-foreground font-medium mb-1">Typical use case</div>
                                            <p className="google-body-small text-muted-foreground">{roleType.useCase}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground">Assignment flow</div>
                    <div className="google-body-medium text-muted-foreground">
                        Step-by-step process for adding and configuring team members
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {assignmentSteps.map((item, index) => (
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
                    <div className="google-headline-small text-foreground">Best practices</div>
                    <div className="google-body-medium text-muted-foreground">
                        Security and operational recommendations for team management
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        {bestPractices.map((item) => (
                            <div key={item} className="flex items-start gap-3">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                                <span className="google-body-small text-muted-foreground">{item}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>



            <Card className="rounded-sm border-input transition-all duration-300 hover:border-primary/50">
                <CardHeader className="rounded-t-sm">
                    <div className="google-headline-small text-foreground">Example team setup</div>
                    <div className="google-body-medium text-muted-foreground">
                        Reference configuration for a typical organization
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-input">
                                    <th className="google-title-small text-foreground text-left p-3">Team Member</th>
                                    <th className="google-title-small text-foreground text-left p-3">Role</th>
                                    <th className="google-title-small text-foreground text-left p-3">Assigned Channels</th>
                                    <th className="google-title-small text-foreground text-left p-3">Region</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-input transition-colors hover:bg-muted/40">
                                    <td className="google-body-small text-foreground p-3">Aisha O.</td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="rounded-full border-0 bg-purple-500/20 text-purple-600">
                                            Admin
                                        </Badge>
                                    </td>
                                    <td className="google-body-small text-muted-foreground p-3">All</td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                            <Globe className="mr-1 h-3 w-3" />
                                            Global
                                        </Badge>
                                    </td>
                                </tr>
                                <tr className="border-b border-input transition-colors hover:bg-muted/40">
                                    <td className="google-body-small text-foreground p-3">Samuel K.</td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="rounded-full border-0 bg-blue-500/20 text-blue-600">
                                            Support Lead
                                        </Badge>
                                    </td>
                                    <td className="google-body-small text-muted-foreground p-3">Voice + Messaging</td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                            <MapPin className="mr-1 h-3 w-3" />
                                            EMEA
                                        </Badge>
                                    </td>
                                </tr>
                                <tr className="border-b border-input transition-colors hover:bg-muted/40">
                                    <td className="google-body-small text-foreground p-3">Fatima Y.</td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-600">
                                            Agent
                                        </Badge>
                                    </td>
                                    <td className="google-body-small text-muted-foreground p-3">WhatsApp + Email</td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                            <MapPin className="mr-1 h-3 w-3" />
                                            West Africa
                                        </Badge>
                                    </td>
                                </tr>
                                <tr className="transition-colors hover:bg-muted/40">
                                    <td className="google-body-small text-foreground p-3">Idris T.</td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="rounded-full border-0 bg-orange-500/20 text-orange-600">
                                            Developer
                                        </Badge>
                                    </td>
                                    <td className="google-body-small text-muted-foreground p-3">API & Integrations Only</td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                            <Globe className="mr-1 h-3 w-3" />
                                            Global
                                        </Badge>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
