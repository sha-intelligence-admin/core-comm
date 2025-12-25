import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/api"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/organizations"

  // Handle recovery flow specifically
  const type = searchParams.get("type")
  if (type === "recovery") {
    next = "/auth/reset-password"
  }

  console.log('🔍 Auth Callback Debug:', { code: code ? 'EXISTS' : 'MISSING', origin, next, type })

  // Debug cookies
  const cookieStore = request.headers.get('cookie')
  console.log('🍪 Cookies present:', cookieStore ? 'YES' : 'NO')
  if (cookieStore) {
    const cookieNames = cookieStore.split(';').map(c => c.trim().split('=')[0])
    console.log('🍪 Cookie names:', cookieNames)
    const hasVerifier = cookieNames.some(n => n.includes('code-verifier'))
    console.log('🍪 Has code verifier:', hasVerifier)
  }

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('🔐 Exchange Code Result:', { 
      hasError: !!error, 
      errorMessage: error?.message,
      hasUser: !!data?.user,
      userId: data?.user?.id 
    })

    // Fallback for missing code verifier (PKCE issue)
    if (error?.message?.includes("code verifier should be non-empty")) {
      console.warn("⚠️ PKCE Verifier missing on server. Redirecting to client-side exchange.")
      // Redirect to the target page with the code, letting the client handle the exchange
      // We construct a URL that the client page can intercept
      const clientRedirectUrl = new URL(next, origin)
      clientRedirectUrl.searchParams.set("code", code)
      if (type) clientRedirectUrl.searchParams.set("type", type)
      return NextResponse.redirect(clientRedirectUrl)
    }
    
    if (!error && data?.user) {
      // ✅ Create user profile after email confirmation
      try {
        // Use service role client to bypass RLS for profile creation
        const supabaseAdmin = createServiceRoleClient()

        // First, check if profile already exists
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!existingUser) {
          // Profile doesn't exist - create it from user_metadata
          const fullName = data.user.user_metadata?.full_name || 
                          data.user.user_metadata?.name ||
                          data.user.email?.split('@')[0] || 
                          'User';
          const phone = data.user.user_metadata?.phone || null;
          const companyId = data.user.user_metadata?.company_id || null;

          const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              phone: phone,
              is_active: true,
              company_id: companyId
            });

          if (insertError) {
            console.error('Error creating user profile in callback:', insertError)
            // Profile creation failed - redirect to error page with details
            const errorMsg = encodeURIComponent(insertError.message);
            return NextResponse.redirect(`${origin}/auth/profile-error?error=${errorMsg}&next=${next}`);
          }
        }

        // ✅ Update team member status if they were invited
        // This ensures invited users become 'active' as soon as they log in
        const { error: updateError } = await supabase
          .from('team_members')
          .update({ 
            status: 'active',
            invitation_accepted_at: new Date().toISOString(),
            last_login_at: new Date().toISOString()
          })
          .eq('user_id', data.user.id)
          .eq('status', 'invited')

        if (updateError) {
          console.error('Error updating team member status:', updateError)
        } else {
          // Also update last_login_at for users who were already active
          await supabase
            .from('team_members')
            .update({ 
              last_login_at: new Date().toISOString()
            })
            .eq('user_id', data.user.id)
        }

        // ✅ Ensure organization_memberships are active
        // This fixes the issue where users don't see the organization after joining
        await supabase
          .from('organization_memberships')
          .update({ 
            status: 'active',
            last_accessed_at: new Date().toISOString()
          })
          .eq('user_id', data.user.id)
          .eq('status', 'inactive') // Only update if inactive (or invited if that was a status)

      } catch (profileError) {
        // Unexpected error during profile creation
        const errorMsg = encodeURIComponent(
          profileError instanceof Error ? profileError.message : 'Unknown error'
        );
        return NextResponse.redirect(`${origin}/auth/profile-error?error=${errorMsg}&next=${next}`);
      }

      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      // Log why we're failing
      console.log('❌ Auth failed:', { hasError: !!error, errorMsg: error?.message, hasData: !!data })
      const errorMsg = error?.message ? encodeURIComponent(error.message) : 'Authentication failed'
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${errorMsg}`)
    }
  } else {
    console.log('❌ No code parameter in callback URL')
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No%20code%20parameter%20provided`)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
