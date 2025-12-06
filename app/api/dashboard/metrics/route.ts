import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    // Fetch total calls
    const { count: totalCalls, error: totalCallsError } = await supabase
      .from("calls")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)

    // Fetch resolved calls
    const { count: resolvedCalls, error: resolvedCallsError } = await supabase
      .from("calls")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("resolution_status", "resolved")

    // Fetch active calls (in-progress)
    const { count: activeCalls, error: activeCallsError } = await supabase
      .from("calls")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("resolution_status", "pending")

    // Fetch calls for duration calculation
    const { data: callsData, error: callsDataError } = await supabase
      .from("calls")
      .select("duration")
      .eq("company_id", companyId)

    // Calculate average call duration
    let avgDuration = 0
    if (callsData && callsData.length > 0) {
      const totalDuration = callsData.reduce((sum, call) => sum + (call.duration || 0), 0)
      avgDuration = Math.round(totalDuration / callsData.length)
    }

    // Fetch active voice agents count
    const { count: activeAgents, error: agentsError } = await supabase
      .from("voice_agents")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("status", "active")

    // Calculate success rate
    const successRate = totalCalls && totalCalls > 0 
      ? ((resolvedCalls || 0) / totalCalls * 100).toFixed(1)
      : "0.0"

    // Format duration as "Xm Ys"
    const formatDuration = (seconds: number) => {
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${minutes}m ${secs}s`
    }

    return NextResponse.json({
      metrics: {
        totalCalls: totalCalls || 0,
        resolvedCalls: resolvedCalls || 0,
        avgDuration: formatDuration(avgDuration),
        avgDurationSeconds: avgDuration,
        mcpActions: 0, // TODO: Implement MCP actions tracking
        activeCalls: activeCalls || 0,
        activeAgents: activeAgents || 0,
        successRate: parseFloat(successRate),
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Internal server error: " + errorMessage }, { status: 500 })
  }
}
