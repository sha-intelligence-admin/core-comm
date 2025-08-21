import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse, AuthenticationError } from '@/lib/error-handling';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new AuthenticationError('Authentication required');
    }

    // Fetch the user profile from the users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
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
    return createErrorResponse(error, 'Failed to fetch user profile');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new AuthenticationError('Authentication required');
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
      return createErrorResponse(updateError, 'Failed to update user profile');
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
    return createErrorResponse(error, 'Failed to update user profile');
  }
}
