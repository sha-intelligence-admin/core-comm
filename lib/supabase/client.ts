import { createBrowserClient } from "@supabase/ssr"

/**
 * Creates a Supabase client for Client Components.
 * Uses a singleton pattern internally by @supabase/ssr to share the instance.
 * 
 * @returns Supabase client for browser usage
 * @throws Error if environment variables are missing
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.",
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,   // ensures session is saved in localStorage
      autoRefreshToken: true, // automatically refresh JWT when expired
    }
  })
}
