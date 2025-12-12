import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const supabaseAdmin = createServiceRoleClient()

    // Find invitation
    const { data: invitation, error } = await supabaseAdmin
      .from("organization_invitations")
      .select("*, company:company_id(name)")
      .eq("invitation_token", token)
      .eq("status", "pending")
      .single()

    if (error || !invitation) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 })
    }

    // Check expiry
    if (new Date(invitation.expires_at) < new Date()) {
      // Update status to expired
      await supabaseAdmin
        .from("organization_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id)
      
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 })
    }

    return NextResponse.json({
      email: invitation.email,
      fullName: invitation.metadata?.full_name,
      companyName: invitation.company?.name || "the organization",
      role: invitation.role
    })

  } catch (error) {
    console.error("Error verifying invite:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
