import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/api'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
      timezone,
      primaryGoals,
      expectedVolume
    } = body

    // Use service role client for company creation
    const serviceSupabase = createServiceRoleClient()

    // Step 1: Create company
    const { data: companyData, error: companyError } = await serviceSupabase
      .from('company')
      .insert({
        name: companyName,
        description: description || null,
        company_size: companySize,
        industry,
        member_key: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique member key
        timezone: timezone || 'UTC',
        business_hours: businessHours ? JSON.parse(JSON.stringify(businessHours)) : null,
        primary_goals: primaryGoals || [],
        expected_volume: expectedVolume ? parseInt(expectedVolume) : null,
        current_volume: supportVolume || null,
        current_solution: currentSolution || null,
        phone_numbers: phoneNumber ? [phoneNumber] : []
      })
      .select()
      .single()

    if (companyError) {
      console.error('Company creation error:', companyError)
      return NextResponse.json(
        { error: 'Failed to create company', details: companyError.message },
        { status: 500 }
      )
    }

    // Step 2: Update user with company_id and mark onboarding complete
    const { error: userUpdateError } = await serviceSupabase
      .from('users')
      .update({
        company_id: companyData.id,
        onboarding_completed: true,
        phone: phoneNumber || null,
        role: 'admin', // First user becomes admin
        metadata: {
          onboarding_completed_at: new Date().toISOString()
        }
      })
      .eq('id', user.id)

    if (userUpdateError) {
      console.error('User update error:', userUpdateError)

      // Try to clean up company if user update fails
      await serviceSupabase
        .from('company')
        .delete()
        .eq('id', companyData.id)

      return NextResponse.json(
        { error: 'Failed to complete onboarding' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        company_id: companyData.id,
        company_name: companyData.name
      }
    })

  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
