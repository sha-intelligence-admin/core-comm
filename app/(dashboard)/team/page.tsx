"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddTeamMemberModal } from "@/components/add-team-member-modal"
import { Badge } from "@/components/ui/badge"
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

const teamMembers = [
    {
        id: "1",
        name: "Aisha O.",
        email: "aisha.o@corecomm.io",
        role: "Admin",
        roleColor: "bg-purple-500/20 text-purple-600",
        channels: "All",
        region: "Global",
        status: "active",
        lastActive: "2 minutes ago",
    },
    {
        id: "2",
        name: "Samuel K.",
        email: "samuel.k@corecomm.io",
        role: "Support Lead",
        roleColor: "bg-blue-500/20 text-blue-600",
        channels: "Voice + Messaging",
        region: "EMEA",
        status: "active",
        lastActive: "5 minutes ago",
    },
    {
        id: "3",
        name: "Fatima Y.",
        email: "fatima.y@corecomm.io",
        role: "Agent",
        roleColor: "bg-green-500/20 text-green-600",
        channels: "WhatsApp + Email",
        region: "West Africa",
        status: "active",
        lastActive: "Just now",
    },
    {
        id: "4",
        name: "Idris T.",
        email: "idris.t@corecomm.io",
        role: "Developer",
        roleColor: "bg-orange-500/20 text-orange-600",
        channels: "API & Integrations Only",
        region: "Global",
        status: "active",
        lastActive: "1 hour ago",
    },
    {
        id: "5",
        name: "Chioma N.",
        email: "chioma.n@corecomm.io",
        role: "Agent",
        roleColor: "bg-green-500/20 text-green-600",
        channels: "Voice + Messaging",
        region: "West Africa",
        status: "active",
        lastActive: "12 minutes ago",
    },
    {
        id: "6",
        name: "David M.",
        email: "david.m@corecomm.io",
        role: "Support Lead",
        roleColor: "bg-blue-500/20 text-blue-600",
        channels: "Email + Messaging",
        region: "North America",
        status: "active",
        lastActive: "8 minutes ago",
    },
]

export default function TeamPage() {
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
                    <Button variant="outline" className="h-11 rounded-sm border-input bg-transparent px-6 hover:border-primary hover:bg-primary hover:text-white">
                        <Mail className="mr-2 h-4 w-4" />
                        Invite by Email
                    </Button>
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
                    <div className="grid gap-4">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex gap-4 rounded-sm border border-input bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/60 hover:bg-muted flex-row items-center justify-between"
                            >
                                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                                            <span className="google-title-small text-primary">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="google-title-small text-foreground">{member.name}</div>
                                            <div className="google-body-small text-muted-foreground mt-1">{member.email}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className={`rounded-full border-0 ${member.roleColor}`}>
                                            {member.role}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                            {member.channels}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-full border-input bg-muted/40 text-muted-foreground">
                                            <MapPin className="mr-1 h-3 w-3" />
                                            {member.region}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-full border-0 bg-green-500/20 text-green-600">
                                            {member.status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="google-body-small text-muted-foreground">{member.lastActive}</span>
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
                                            <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                                                Resend Invitation
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                                Remove from Team
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
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
