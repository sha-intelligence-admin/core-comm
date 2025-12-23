import { createClient } from "@/lib/supabase/server"
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
      // ✅ Create user profile after email confirmation
      try {
        // First, check if profile already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!existingUser) {
          // Profile doesn't exist - create it from user_metadata
          const fullName = data.user.user_metadata?.full_name || 
                          data.user.email?.split('@')[0] || 
                          'User';
          const phone = data.user.user_metadata?.phone || null;
          const companyId = data.user.user_metadata?.company_id || null;

          const { error: insertError } = await supabase
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
