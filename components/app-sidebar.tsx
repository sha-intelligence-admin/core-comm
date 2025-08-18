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
} from "@/components/ui/sidebar"
import { LayoutDashboard, Phone, Settings, Plug, User } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogoutButton } from "./auth-actions"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Call Logs",
    url: "/call-logs",
    icon: Phone,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: Plug,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-brand/20">
      <SidebarHeader className="p-4 hover:bg-brand/5 transition-colors duration-300 group">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
            <span className="text-white font-bold text-sm">CC</span>
          </div>
          <span className="font-bold text-lg group-hover:text-brand transition-colors duration-200">CoreComm</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-brand/70 font-semibold hover:text-brand transition-colors duration-200">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="group">
                    <Link
                      href={item.url}
                      className="flex items-center space-x-2 hover:bg-brand/10 hover:text-brand hover:border-l-4 hover:border-brand hover:scale-105 hover:shadow-md transition-all duration-300 rounded-r-lg"
                    >
                      <item.icon className="h-4 w-4 group-hover:scale-110 group-hover:text-brand transition-all duration-200" />
                      <span className="group-hover:font-medium transition-all duration-200">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-brand/10 hover:border hover:border-brand/30 rounded-lg p-2 transition-all duration-300 hover:shadow-md group">
              <Avatar className="h-8 w-8 group-hover:scale-110 group-hover:ring-2 group-hover:ring-brand/30 transition-all duration-300">
                <AvatarImage src="/placeholder-40x40.png" />
                <AvatarFallback className="group-hover:bg-brand/20 group-hover:text-brand transition-colors duration-200">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium group-hover:text-brand transition-colors duration-200">John Doe</p>
                <p className="text-xs text-muted-foreground group-hover:text-brand/70 transition-colors duration-200">
                  john@company.com
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
