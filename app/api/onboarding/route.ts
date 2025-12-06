import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const {
      companyName,
      description,
      companySize,
      industry,
      supportVolume,
      currentSolution,
      phoneNumber,
      businessHours,
      customHours,
      timezone,
      primaryGoals,
      expectedVolume,
      successMetrics,
    } = body

    // Validate required fields
    if (!companyName || !companySize || !industry) {
      return NextResponse.json(
        { error: "Missing required fields: companyName, companySize, and industry are required" },
        { status: 400 }
      )
    }

    // Check if user already has a company
    // Use service role client to bypass RLS and avoid circular reference
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle()

    // If user doesn't exist in users table, we'll create their profile in the next step
    // Only return error if it's not a "not found" error
    if (userCheckError && userCheckError.code !== "PGRST116") {
      return NextResponse.json({ error: "Failed to verify user status: " + userCheckError.message }, { status: 500 })
    }

    if (existingUser?.company_id) {
      return NextResponse.json({ error: "User already has a company" }, { status: 400 })
    }

    // Generate a unique member key for the company
    const memberKey = nanoid(16)

    // Prepare business hours
    let businessHoursJson: Record<string, unknown> | null = null
    if (businessHours === "custom" && customHours) {
      try {
        businessHoursJson = typeof customHours === "string" ? JSON.parse(customHours) : customHours
      } catch (e) {
        businessHoursJson = { type: "custom", hours: customHours }
      }
    } else if (businessHours) {
      businessHoursJson = { type: businessHours }
    }

    // Prepare phone numbers array
    const phoneNumbers = phoneNumber ? [phoneNumber] : []

    // Create company with only guaranteed columns
    // Note: Some columns like current_solution and current_volume may not exist
    // depending on which migration was run
    const { data: company, error: companyError } = await supabase
      .from("company")
      .insert({
        name: companyName,
        company_size: companySize,
        industry: industry,
        member_key: memberKey,
        timezone: timezone || "UTC",
        ...(description && { description }),
        ...(phoneNumbers.length > 0 && { phone_numbers: phoneNumbers }),
        ...(businessHoursJson && { business_hours: businessHoursJson }),
        ...(primaryGoals && primaryGoals.length > 0 && { primary_goals: primaryGoals }),
        ...(expectedVolume && { expected_volume: parseInt(expectedVolume, 10) }),
        ...(successMetrics && { success_metrics: successMetrics }),
      })
      .select()
      .single()

    if (companyError) {
      return NextResponse.json({ error: "Failed to create company: " + companyError.message }, { status: 500 })
    }

    // Update or create user with company_id
    // Use upsert to handle cases where user profile doesn't exist yet
    const { error: updateError } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email!,
          company_id: company.id,
          full_name: user.user_metadata?.full_name || null,
          phone: user.user_metadata?.phone || null,
          role: "admin", // First user in company is admin
          is_active: true,
        },
        {
          onConflict: "id",
        }
      )
      .eq("id", user.id)

    if (updateError) {
      // Try to rollback company creation
      await supabase.from("company").delete().eq("id", company.id)
      return NextResponse.json({ error: "Failed to link user to company: " + updateError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        company: {
          id: company.id,
          name: company.name,
          memberKey: company.member_key,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Internal server error: " + errorMessage }, { status: 500 })
  }
}
