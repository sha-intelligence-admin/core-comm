import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    } else {
      redirect("/dashboard")
    }
  } catch (error) {
    // If Supabase is not configured, redirect to setup page
    console.warn("Supabase not configured, redirecting to setup")
    redirect("/setup")
  }
}
