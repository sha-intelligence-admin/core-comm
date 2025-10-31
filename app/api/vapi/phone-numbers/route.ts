import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';
import { CreatePhoneNumberSchema } from '@/lib/validations';
import {
  createPhoneNumber,
  listPhoneNumbers,
} from '@/lib/vapi/phone-numbers';

/**
 * GET /api/vapi/phone-numbers
 * List all phone numbers for the user's company
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Get user's company_id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.company_id) {
      return createErrorResponse('User not associated with a company', 403);
    }

    // List phone numbers
    const phoneNumbers = await listPhoneNumbers(userProfile.company_id);

    return createSuccessResponse({ phoneNumbers });
  } catch (error) {
    console.error('Error in GET /api/vapi/phone-numbers:', error);
    return createErrorResponse('Failed to fetch phone numbers', 500);
  }
}

/**
 * POST /api/vapi/phone-numbers
 * Create or provision a new phone number
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Get user's company_id and role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.company_id) {
      return createErrorResponse('User not associated with a company', 403);
    }

    // Only admins can create phone numbers
    if (userProfile.role !== 'admin') {
      return createErrorResponse('Only admins can provision phone numbers', 403);
    }

    // Validate request body
    const body = await request.json();
    const validatedData = CreatePhoneNumberSchema.parse(body);

    // Verify assistant exists if provided
    if (validatedData.assistantId) {
      const { data: assistant, error: assistantError } = await supabase
        .from('vapi_assistants')
        .select('id')
        .eq('id', validatedData.assistantId)
        .eq('company_id', userProfile.company_id)
        .single();

      if (assistantError || !assistant) {
        return createErrorResponse('Assistant not found', 404);
      }
    }

    // Create phone number
    const phoneNumber = await createPhoneNumber(
      userProfile.company_id,
      validatedData
    );

    return createSuccessResponse(
      { phoneNumber },
      'Phone number provisioned successfully'
    );
  } catch (error) {
    console.error('Error in POST /api/vapi/phone-numbers:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Failed to provision phone number', 500);
  }
}
