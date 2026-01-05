import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/dashboard/activity
 * Retrieves recent call activity for the dashboard.
 * 
 * @param request - NextRequest object containing query parameters (limit)
 * @returns JSON response with a list of recent calls
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle()

    if (userError || !userData?.company_id) {
      return NextResponse.json(
        { error: "User must complete onboarding first" },
        { status: 403 }
      )
    }

    const companyId = userData.company_id

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10", 10)

    // Fetch recent calls
    const { data: calls, error: callsError } = await supabase
      .from("calls")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (callsError) {
      return NextResponse.json({ error: "Failed to fetch calls: " + callsError.message }, { status: 500 })
    }

    return NextResponse.json({
      calls: calls || [],
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Internal server error: " + errorMessage }, { status: 500 })
  }
}
