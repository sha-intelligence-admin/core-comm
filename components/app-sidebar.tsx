"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Phone, Settings, Plug, User, Loader2, Bot, PhoneCall, MessageSquare, Mail, BarChart3, Users, Shield, HelpCircle, Building2, CreditCard } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogoutButton } from "./auth-actions"
import { useUserProfile } from "@/hooks/use-user-profile"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "AI Agents",
    url: "/ai-agents",
    icon: Bot,
  },
  {
    title: "Numbers",
    url: "/numbers",
    icon: PhoneCall,
  },
  {
    title: "Messaging",
    url: "/messaging",
    icon: MessageSquare,
  },
  {
    title: "Email",
    url: "/email",
    icon: Mail,
  },
  {
    title: "Call Logs",
    url: "/call-logs",
    icon: Phone,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: Plug,
  },
  {
    title: "Team",
    url: "/team",
    icon: Users,
  },
  {
    title: "Security",
    url: "/security",
    icon: Shield,
  },
  {
    title: "Support",
    url: "/support",
    icon: HelpCircle,
  },
  {
    title: "Billing",
    url: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { profile, loading, getInitials, getDisplayName } = useUserProfile()
  const pathname = usePathname()
  const { setOpenMobile, isMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar className="border-r border-input bg-sidebarbg">
      <div className="flex justify-start items-center space-x-2 p-4 transition-colors duration-300 group">
        <img src="/logo.webp" alt="Logo" className="w-10" />
        <span className="google-headline-small">CoreComm</span>
      </div>

      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel className="text-brand/70 font-semibold hover:text-brand transition-colors duration-200">
            Platform
          </SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.url)

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="group text-icons data-[active=true]:text-primary"
                      isActive={isActive}
                    >
                    <Link
                      href={item.url}
                      onClick={handleLinkClick}
                        className="flex items-center space-x-2 hover:bg-brand/10 transition-all duration-300 rounded-r-lg"
                    >
                      <item.icon className="h-5 w-5 transition-all duration-200" />
                      <span className="group-hover:font-medium transition-all duration-200">{item.title}</span>
                    </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-brand/10 hover:border hover:border-brand/30 rounded-lg p-2 transition-all duration-300 hover:shadow-md group">
              <Avatar className="h-8 w-8 group-hover:scale-110 group-hover:ring-2 group-hover:ring-brand/30 transition-all duration-300">
                <AvatarImage src={profile?.avatar_url || "/placeholder-40x40.png"} />
                <AvatarFallback className="group-hover:bg-brand/20 group-hover:text-brand transition-colors duration-200">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium group-hover:text-brand transition-colors duration-200">
                  {loading ? "Loading..." : getDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground group-hover:text-brand/70 transition-colors duration-200">
                  {loading ? "" : (profile?.email || "No email")}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="hover:bg-brand/10 hover:text-brand transition-colors duration-200">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-brand/10 hover:text-brand transition-colors duration-200">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200 p-0">
              <LogoutButton
                variant="ghost"
                className="w-full justify-start h-auto p-2 hover:bg-red-50 hover:text-red-600"
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
