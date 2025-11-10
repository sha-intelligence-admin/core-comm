import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard"

  console.log('🔍 Auth Callback Debug:', { code: code ? 'EXISTS' : 'MISSING', origin, next })

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('🔐 Exchange Code Result:', { 
      hasError: !!error, 
      errorMessage: error?.message,
      hasUser: !!data?.user,
      userId: data?.user?.id 
    })
    
    if (!error && data?.user) {
      // ✅ CRITICAL: Create user profile after email confirmation
      try {
        // First, check if profile already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, company_id')
          .eq('id', data.user.id)
          .maybeSingle() // Use maybeSingle to avoid error if not found

        let hasCompanyId = false

        if (!existingUser) {
          // Profile doesn't exist - create it from user_metadata
          const fullName = data.user.user_metadata?.full_name || 
                          data.user.email?.split('@')[0] || 
                          'User';
          const phone = data.user.user_metadata?.phone || null;

          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              phone: phone,
              role: 'admin', // First user is admin
              is_active: true,
            });

          if (insertError) {
            // Profile creation failed - redirect to error page with details
            const errorMsg = encodeURIComponent(insertError.message);
            return NextResponse.redirect(`${origin}/auth/profile-error?error=${errorMsg}&next=${next}`);
          }
          // New user has no company_id
          hasCompanyId = false
        } else {
          // Check if existing user has completed onboarding
          hasCompanyId = !!existingUser.company_id
        }

        // If user doesn't have company_id and next param is not already /onboarding, redirect to onboarding
        if (!hasCompanyId && next !== '/onboarding') {
          const forwardedHost = request.headers.get("x-forwarded-host")
          const isLocalEnv = process.env.NODE_ENV === "development"
          
          if (isLocalEnv) {
            return NextResponse.redirect(`${origin}/onboarding`)
          } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}/onboarding`)
          } else {
            return NextResponse.redirect(`${origin}/onboarding`)
          }
        }
      } catch (profileError) {
        // Unexpected error during profile creation
        const errorMsg = encodeURIComponent(
          profileError instanceof Error ? profileError.message : 'Unknown error'
        );
        return NextResponse.redirect(`${origin}/auth/profile-error?error=${errorMsg}&next=${next}`);
      }

      const forwardedHost = request.headers.get("x-forwarded-host") // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development"
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      // Log why we're failing
      console.log('❌ Auth failed:', { hasError: !!error, errorMsg: error?.message, hasData: !!data })
    }
  } else {
    console.log('❌ No code parameter in callback URL')
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
