"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
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
  const supabase = createClient()

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error.message)
        setIsLoading(false)
        return
      }

      // Clear any local storage items
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      // Force a hard redirect to clear all state
      window.location.href = "/auth/login"
    } catch (err) {
      console.error("Unexpected error during logout:", err)
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
