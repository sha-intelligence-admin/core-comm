import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';
import { UpdatePhoneNumberSchema } from '@/lib/validations';
import {
  getPhoneNumber,
  updatePhoneNumber,
  deletePhoneNumber,
  getPhoneNumberStats,
} from '@/lib/vapi/phone-numbers';

/**
 * GET /api/vapi/phone-numbers/[id]
 * Get a single phone number with statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // Get phone number
    const phoneNumber = await getPhoneNumber(id, userProfile.company_id);

    // Get statistics
    const stats = await getPhoneNumberStats(id, userProfile.company_id);

    return createSuccessResponse({
      phoneNumber,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/vapi/phone-numbers/[id]:', error);

    if (error instanceof Error && error.message === 'Phone number not found') {
      return createErrorResponse('Phone number not found', 404);
    }

    return createErrorResponse('Failed to fetch phone number', 500);
  }
}

/**
 * PATCH /api/vapi/phone-numbers/[id]
 * Update a phone number's configuration
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // Only admins can update phone numbers
    if (userProfile.role !== 'admin') {
      return createErrorResponse('Only admins can update phone numbers', 403);
    }

    // Validate request body
    const body = await request.json();
    const validatedData = UpdatePhoneNumberSchema.parse(body);

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

    // Update phone number
    const phoneNumber = await updatePhoneNumber(
      id,
      userProfile.company_id,
      validatedData
    );

    return createSuccessResponse(
      { phoneNumber },
      'Phone number updated successfully'
    );
  } catch (error) {
    console.error('Error in PATCH /api/vapi/phone-numbers/[id]:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400);
    }

    if (error instanceof Error && error.message === 'Phone number not found') {
      return createErrorResponse('Phone number not found', 404);
    }

    if (error instanceof Error && error.message === 'Assistant not found') {
      return createErrorResponse('Assistant not found', 404);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Failed to update phone number', 500);
  }
}

/**
 * DELETE /api/vapi/phone-numbers/[id]
 * Delete a phone number
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // Only admins can delete phone numbers
    if (userProfile.role !== 'admin') {
      return createErrorResponse('Only admins can delete phone numbers', 403);
    }

    // Delete phone number
    await deletePhoneNumber(id, userProfile.company_id);

    return createSuccessResponse(null, 'Phone number deleted successfully');
  } catch (error) {
    console.error('Error in DELETE /api/vapi/phone-numbers/[id]:', error);

    if (error instanceof Error && error.message === 'Phone number not found') {
      return createErrorResponse('Phone number not found', 404);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Failed to delete phone number', 500);
  }
}
