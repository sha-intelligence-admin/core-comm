import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNavigation } from "@/components/top-navigation"
import { PasswordSetupAlert } from "@/components/password-setup-alert"
import { TwoFactorEnforcementAlert } from "@/components/two-factor-enforcement-alert"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth is already handled by middleware, no need to check here
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNavigation />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <PasswordSetupAlert />
          <TwoFactorEnforcementAlert />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
