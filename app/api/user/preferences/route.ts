import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/user/preferences
 * Retrieves the authenticated user's preferences.
 * 
 * @param request - NextRequest object
 * @returns JSON response with user preferences
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user preferences from metadata
    const { data: userData, error } = await supabase
      .from('users')
      .select('metadata')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    const preferences = (userData.metadata as any)?.preferences || {}

    return NextResponse.json({
      success: true,
      data: preferences
    })

  } catch (error) {
    console.error('Get preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/preferences
 * Updates the authenticated user's preferences.
 * 
 * @param request - NextRequest object containing preferences updates
 * @returns JSON response with success message or error
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { preferences } = body

    // Get current metadata
    const { data: currentUser } = await supabase
      .from('users')
      .select('metadata')
      .eq('id', user.id)
      .single()

    const currentMetadata = (currentUser?.metadata as any) || {}

    // Update metadata with new preferences
    const { error } = await supabase
      .from('users')
      .update({
        metadata: {
          ...currentMetadata,
          preferences: {
            ...currentMetadata.preferences,
            ...preferences
          }
        }
      })
      .eq('id', user.id)

    if (error) {
      console.error('Update preferences error:', error)
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully'
    })

  } catch (error) {
    console.error('Update preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
