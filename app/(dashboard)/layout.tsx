import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNavigation } from "@/components/top-navigation"
import { requireAuth } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure user is authenticated
  await requireAuth()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNavigation />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
