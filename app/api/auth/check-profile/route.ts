import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Diagnostic endpoint to check if user profile exists
 * GET /api/auth/check-profile
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        error: "Not authenticated",
        details: authError?.message
      }, { status: 401 });
    }

    // Check if profile exists in public.users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        user_metadata: user.user_metadata,
      },
      profile: profile || null,
      profileError: profileError ? {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
      } : null,
      hasProfile: !!profile,
      hasCompanyId: !!profile?.company_id,
    });
    
  } catch (error) {
    return NextResponse.json({
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
