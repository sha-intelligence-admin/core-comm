"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"
import { LoadingSpinner } from "./loading-spinner"

interface LogoutButtonProps {
  children?: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function LogoutButton({ children, variant = "ghost", size = "default", className }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error.message)
        return
      }

      // Redirect to login page
      router.push("/auth/login")
      router.refresh()
    } catch (err) {
      console.error("Unexpected error during logout:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleLogout} disabled={isLoading} className={className}>
      {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4" size="sm" /> : <LogOut className="mr-2 h-4 w-4" />}
      {children || "Sign out"}
    </Button>
  )
}
