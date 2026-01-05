import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * Retrieves the current authenticated user from Supabase.
 * Redirects to login page if no session exists.
 * 
 * @returns The authenticated user object
 * @throws Redirects to /auth/login if unauthorized
 */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return user
}

/**
 * Enforces authentication for a route.
 * Alias for getUser() to make intent clearer in page components.
 * 
 * @returns The authenticated user object
 */
export async function requireAuth() {
  return await getUser()
}
