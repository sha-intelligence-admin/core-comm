import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
 
// This is the correct, idiomatic way to create a server client in Next.js.
// It ensures a new client is created on each request context.
export const createServerSupabase = () => {
  const cookieStore = cookies()
 
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set(name, '', options)
        },
      },
    }
  )
}
