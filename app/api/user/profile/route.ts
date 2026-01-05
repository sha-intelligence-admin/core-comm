import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

/**
 * GET /api/user/profile
 * Retrieves the authenticated user's profile.
 * 
 * @param req - NextRequest object
 * @returns JSON response with user profile data
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Fetch the user profile from the users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return createErrorResponse('User profile not found', 404);
    }

    return createSuccessResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          ...profile
        }
      },
      'Profile fetched successfully'
    );

  } catch (error) {
    console.error('User profile API error:', error);
    return createErrorResponse('Failed to fetch user profile', 500);
  }
}

/**
 * PUT /api/user/profile
 * Updates the authenticated user's profile.
 * 
 * @param req - NextRequest object containing profile updates
 * @returns JSON response with updated user profile
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const body = await req.json();
    const { full_name, phone, avatar_url } = body;

    // Update the user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        full_name: full_name?.trim(),
        phone: phone?.trim() || null,
        avatar_url: avatar_url?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return createErrorResponse('Failed to update user profile', 500);
    }

    return createSuccessResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          ...updatedProfile
        }
      },
      'Profile updated successfully'
    );

  } catch (error) {
    console.error('Profile update API error:', error);
    return createErrorResponse('Failed to update user profile', 500);
  }
}
