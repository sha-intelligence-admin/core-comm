import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

/**
 * GET /api/organizations
 * Lists organizations the user is a member of.
 * 
 * @returns JSON response with list of organizations and membership details
 */
export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceSupabase = createServiceRoleClient()

    // Fetch user's organizations through organization_memberships
    const { data: memberships, error: membershipsError } = await serviceSupabase
      .from("organization_memberships")
      .select(`
        *,
        company:company_id (
          *,
          team_members:team_members(count)
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("is_default", { ascending: false })
      .order("last_accessed_at", { ascending: false })

    if (membershipsError) {
      console.error("Error fetching memberships:", membershipsError)
      return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 })
    }

    // Transform the data to include member_count and membership info
    const organizations = memberships?.map((membership) => ({
      ...membership.company,
      member_count: membership.company.team_members?.[0]?.count || 0,
      team_members: undefined,
      // Add membership details
      membership_role: membership.role,
      membership_status: membership.status,
      is_default: membership.is_default,
      joined_at: membership.joined_at,
      last_accessed: membership.last_accessed_at,
    })) || []

    return NextResponse.json({
      companies: organizations,
    })
  } catch (error) {
    console.error("Error in organizations API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
