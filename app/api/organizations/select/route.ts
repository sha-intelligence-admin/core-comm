import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
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

    // Verify user has access to this company
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single()

    if (userError || userData?.company_id !== companyId) {
      return NextResponse.json({ error: "Access denied to this organization" }, { status: 403 })
    }

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
