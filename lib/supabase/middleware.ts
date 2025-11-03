import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Simple security headers function
function setSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  return response
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, allow access to all routes
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not configured. Authentication is disabled.")
    const response = NextResponse.next({ request })
    return setSecurityHeaders(response)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/signup', 
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/callback',
    '/auth/auth-code-error',
    '/setup',
    '/api/health'
  ]
  
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname) || 
                       request.nextUrl.pathname.startsWith('/_next') ||
                       request.nextUrl.pathname.startsWith('/favicon')

  // Redirect unauthenticated users from protected routes
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    const redirectResponse = NextResponse.redirect(url)
    return setSecurityHeaders(redirectResponse)
  }

  // Redirect authenticated users away from auth pages
  if (user && request.nextUrl.pathname.startsWith('/auth/') && 
      request.nextUrl.pathname !== '/auth/callback') {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    const redirectResponse = NextResponse.redirect(url)
    return setSecurityHeaders(redirectResponse)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object here instead of the supabaseResponse object

  return setSecurityHeaders(supabaseResponse)
}
