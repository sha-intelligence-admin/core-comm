import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
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
import { Search, Bell, User, Settings } from "lucide-react"

export function TopNavigation() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-brand/20 px-4 bg-gradient-to-r from-brand/5 to-transparent">
      <SidebarTrigger className="-ml-1 hover:bg-brand/10 hover:text-brand transition-all duration-200 hover:scale-110" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-brand/30" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard" className="hover:text-brand transition-colors duration-200 font-medium">
              CoreComm
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block text-brand/50" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-brand font-medium">Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center space-x-4">
        <div className="relative hidden md:block group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-brand transition-colors duration-200" />
          <Input
            placeholder="Search calls, customers..."
            className="pl-10 w-64 rounded-xl border-brand/20 focus:border-brand focus:ring-brand/20 hover:border-brand/40 transition-all duration-200"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          className="rounded-xl bg-transparent hover:bg-brand hover:text-white hover:border-brand hover:scale-110 transition-all duration-200"
        >
          <Bell className="h-4 w-4" />
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-brand/30 transition-all duration-200 hover:scale-110"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-40x40.png" alt="User" />
                <AvatarFallback className="bg-brand/10 text-brand">JD</AvatarFallback>
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
        </DropdownMenu>
      </div>
    </header>
  )
}
