import { NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { companyId } = await request.json()

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceSupabase = createServiceRoleClient()

    // Verify user has access to this company via organization_memberships
    const { data: membership, error: membershipError } = await serviceSupabase
      .from("organization_memberships")
      .select("id, role, status")
      .eq("user_id", user.id)
      .eq("company_id", companyId)
      .eq("status", "active")
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: "Access denied to this organization" }, { status: 403 })
    }

    // Update user's current company_id in users table
    const { error: updateError } = await serviceSupabase
      .from("users")
      .update({ company_id: companyId })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to update user context:", updateError)
      return NextResponse.json({ error: "Failed to switch organization" }, { status: 500 })
    }

    // Update last_accessed_at
    await serviceSupabase
      .from("organization_memberships")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("id", membership.id)

    // Store selected company in cookie
    const cookieStore = await cookies()
    cookieStore.set("selected_company_id", companyId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error selecting organization:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
