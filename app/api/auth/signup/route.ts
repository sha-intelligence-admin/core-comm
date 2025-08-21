import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/superbaseClient';
import { CreateUserProfileSchema } from '@/lib/validations';
import { authRateLimit } from '@/lib/rate-limit';
import { createErrorResponse, ValidationError, RateLimitError, createSuccessResponse } from '@/lib/error-handling';

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await authRateLimit(req);
    if (!rateLimitResult.success) {
      throw new RateLimitError();
    }

    // Validate request body
    const body = await req.json();
    
    if (!body.userId) {
      throw new ValidationError('User ID is required');
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

    const supabaseServer = createServerSupabase();

    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .insert([sanitizedData])
      .select()
      .single();

    if (userError) {
      console.error("Error inserting user profile:", userError);
      
      // Don't expose database errors to client
      if (userError.code === '23505') { // Unique constraint violation
        return createErrorResponse(new ValidationError('User profile already exists'));
      }
      
      throw new Error('Failed to create user profile');
    }

    return createSuccessResponse(
      { user: userData },
      'User profile created successfully'
    );
    
  } catch (error) {
    return createErrorResponse(error, 'Failed to create user profile');
  }
}
