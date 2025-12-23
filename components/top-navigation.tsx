"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./theme-toggle"
import { LogoutButton } from "./auth-actions"
import { Search, Bell, User, Settings, Loader2 } from "lucide-react"
import { useUserProfile } from "@/hooks/use-user-profile"
import { SidebarTrigger } from "./ui/sidebar"
import { usePathname } from "next/navigation"
import { Fragment, useState, useEffect } from "react"

export function TopNavigation() {
  const { profile, loading, getInitials } = useUserProfile()
  const pathname = usePathname()
  const [orgNameMap, setOrgNameMap] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchOrgs = async () => {
      if (Object.keys(orgNameMap).length > 0) return
      
      try {
        const res = await fetch('/api/organizations')
        if (res.ok) {
          const data = await res.json()
          const map: Record<string, string> = {}
          data.companies?.forEach((org: any) => {
            map[org.id] = org.name
          })
          setOrgNameMap(map)
        }
      } catch (e) {
        console.error("Failed to fetch organizations for breadcrumbs", e)
      }
    }

    fetchOrgs()
  }, [orgNameMap])

  const rawSegments = pathname.split("?")[0].split("/").filter(Boolean)
  const hasDashboardSegment = rawSegments[0] === "dashboard"
  const additionalSegments = hasDashboardSegment ? rawSegments.slice(1) : rawSegments

  const segmentLabelMap: Record<string, string> = {
    dashboard: "Dashboard",
    analytics: "Analytics",
    "ai-agents": "AI Agents",
    "call-logs": "Call Logs",
    integrations: "Integrations",
    messaging: "Messaging",
    email: "Email",
    numbers: "Numbers",
    organizations: "Organizations",
    security: "Security",
    settings: "Settings",
    support: "Support",
    team: "Team",
    onboarding: "Onboarding",
    join: "Join",
  }

  const formatSegment = (segment: string) => {
    const clean = segment.replace(/[\[\]]/g, "")
    return segmentLabelMap[clean] ?? clean.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")
  }

  const currentOrgName = profile?.company_id ? orgNameMap[profile.company_id] : null
  let breadcrumbItems: { label: string; href: string; isCurrent: boolean }[] = []

  if (pathname.startsWith('/organizations')) {
    // Organizations context
    breadcrumbItems.push({ 
      label: "Organizations", 
      href: "/organizations", 
      isCurrent: pathname === '/organizations' 
    })

    if (pathname !== '/organizations') {
      additionalSegments.forEach((segment, index) => {
        if (segment === 'organizations') return

        const cleanSegment = segment.replace(/[\[\]]/g, "")
        const isOrgId = index > 0 && additionalSegments[index - 1] === 'organizations' // In raw segments, organizations is index 0
        // Actually, rawSegments for /organizations/123 is ['organizations', '123']
        // additionalSegments is same.
        
        // If segment is ID, use name
        const label = orgNameMap[cleanSegment] || formatSegment(cleanSegment)
        const href = `/${additionalSegments.slice(0, index + 1).join("/")}`
        
        breadcrumbItems.push({
          label,
          href,
          isCurrent: index === additionalSegments.length - 1
        })
      })
    }
  } else {
    // Dashboard context
    breadcrumbItems.push({ 
      label: "Organizations", 
      href: "/organizations", 
      isCurrent: false 
    })

    if (currentOrgName) {
      breadcrumbItems.push({ 
        label: currentOrgName, 
        href: "/dashboard", 
        isCurrent: false 
      })
    }

    if (pathname === '/dashboard' || (hasDashboardSegment && additionalSegments.length === 0)) {
      breadcrumbItems.push({ 
        label: "Dashboard", 
        href: "/dashboard", 
        isCurrent: true 
      })
    } else {
      // Other pages
      additionalSegments.forEach((segment, index) => {
        const href = hasDashboardSegment 
          ? `/dashboard/${additionalSegments.slice(0, index + 1).join("/")}`
          : `/${additionalSegments.slice(0, index + 1).join("/")}`

        breadcrumbItems.push({
          label: formatSegment(segment),
          href,
          isCurrent: index === additionalSegments.length - 1
        })
      })
    }
  }

  const renderBreadcrumbs = () => (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <Fragment key={`${item.href}-${item.label}-${index}`}>
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage className="google-body-small text-primary">{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={item.href}
                  className="google-body-small text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )

  return (
    <header className="flex flex-col sticky top-0 z-10 border-b border-input bg-sidebarbg px-4">
      {/* Top bar */}
      <div className="flex h-16 border-b border-input lg:border-0 items-center justify-between">
        <div className="flex items-center justify-center space-x-2">
          <img src="/logo.webp" alt="Logo" className="w-10 lg:hidden" />
          <div className="hidden lg:block">
            {renderBreadcrumbs()}
          </div>

        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl bg-transparent hover:bg-primary hover:text-white hover:border-primary hover:scale-110 transition-all duration-200"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <ThemeToggle />

          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-brand/30 transition-all duration-200 hover:scale-110"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || "/placeholder-40x40.png"} alt="User" />
                  <AvatarFallback className="bg-brand/10 text-brand">
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="hover:bg-brand/10 hover:text-brand transition-colors duration-200">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-brand/10 hover:text-brand transition-colors duration-200">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200 p-0">
                <LogoutButton
                  variant="ghost"
                  className="w-full justify-start h-auto p-2 hover:bg-red-50 hover:text-red-600"
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}

          {/* Search for top bar on small screens */}
          <div className="ml-auto relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search calls, customers..."
              className="pl-10 w-64 rounded-xl border-input focus:border-primary hover:ring-0 transition-all duration-200"
            />
          </div>
          <div className="flex lg:hidden">
            <SidebarTrigger />
          </div>

        </div>
      </div>

      {/* Bottom bar for small screens */}
      <div className="flex items-center justify-between py-2 lg:hidden">
        {renderBreadcrumbs()}

        {/* Search bar at bottom right */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search calls, customers..."
            className="pl-10 w-48 rounded-xl border-input focus:border-primary focus:ring-brand/20 hover:border-brand/40 transition-all duration-200"
          />
        </div>
      </div>

      {/* Breadcrumbs and search for md and above */}
  <div className="hidden" />
    </header>
  )
}
