import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Not authenticated - redirect to login
    redirect("/auth/login")
  }

  // Authenticated - redirect to dashboard
  redirect("/dashboard")
}
