import { NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { token, password, fullName } = await request.json()

    if (!token || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabaseAdmin = createServiceRoleClient()

    // 1. Verify invitation again
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from("organization_invitations")
      .select("*")
      .eq("invitation_token", token)
      .eq("status", "pending")
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json({ error: "Invalid invitation" }, { status: 400 })
    }

    // 2. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        company_id: invitation.company_id
      }
    })

    if (authError) {
      console.error("Auth creation error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // 3. Create User Profile
    const { error: profileError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId,
        email: invitation.email,
        full_name: fullName,
        company_id: invitation.company_id,
        is_active: true
      })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Rollback auth user? Ideally yes, but for now just log
    }

    // 4. Create Organization Membership
    const orgRoleMap: Record<string, string> = {
      'admin': 'admin',
      'manager': 'manager',
      'agent': 'member',
      'viewer': 'viewer',
      'developer': 'member'
    }
    const orgRole = orgRoleMap[invitation.role] || 'member'

    await supabaseAdmin
      .from("organization_memberships")
      .insert({
        user_id: userId,
        company_id: invitation.company_id,
        role: orgRole,
        status: "active",
        is_default: true
      })

    // 5. Create Team Member entry
    await supabaseAdmin
      .from("team_members")
      .insert({
        user_id: userId,
        company_id: invitation.company_id,
        full_name: fullName,
        email: invitation.email,
        role: invitation.role,
        status: "active",
        created_by: invitation.invited_by,
        invitation_accepted_at: new Date().toISOString(),
        department: invitation.metadata?.department,
        permissions: invitation.metadata?.permissions || {}
      })

    // 6. Update Invitation Status
    await supabaseAdmin
      .from("organization_invitations")
      .update({ 
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_by: userId
      })
      .eq("id", invitation.id)

    // 7. Log the user in (Create session)
    // Since we are on server side, we can't set session cookie for client directly easily without password sign in
    // But we just created the user. The client can't auto-login unless we return a session.
    // However, `admin.createUser` doesn't return a session.
    // We can use `signInWithPassword` here to get a session and set cookies.
    
    const supabase = await createClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: invitation.email,
      password: password
    })

    if (sessionError) {
      console.error("Auto-login failed:", sessionError)
      // User created but login failed, they can just login manually
      return NextResponse.json({ success: true, message: "Account created. Please log in." })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error accepting invite:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
