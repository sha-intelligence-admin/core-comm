import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';
import { CreateUserProfileSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const body = await req.json();

    if (!body.userId) {
      return createErrorResponse('User ID is required', 400);
    }

    const validatedProfile = CreateUserProfileSchema.parse({
      email: body.email,
      full_name: body.fullName,
      phone: body.phone || null
    });

    // Sanitize inputs
    const sanitizedData = {
      id: body.userId,
      email: validatedProfile.email.toLowerCase().trim(),
      full_name: validatedProfile.full_name.trim(),
      phone: validatedProfile.phone?.trim() || null
    };

    const supabaseServer = createServiceRoleClient();

    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .insert([sanitizedData])
      .select()
      .single();

    if (userError) {
      console.error("Error inserting user profile:", userError);

      // Don't expose database errors to client
      if (userError.code === '23505') { // Unique constraint violation
        return createErrorResponse('User profile already exists', 409);
      }

      return createErrorResponse('Failed to create user profile', 500);
    }

    return createSuccessResponse(
      { user: userData },
      'User profile created successfully'
    );

  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400);
    }
    return createErrorResponse('Failed to create user profile', 500);
  }
}
