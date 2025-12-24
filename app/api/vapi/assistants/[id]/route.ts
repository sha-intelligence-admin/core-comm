import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';
import { UpdateAssistantSchema } from '@/lib/validations';
import {
  getAssistant,
  updateAssistant,
  deleteAssistant,
  getAssistantStats,
} from '@/lib/vapi/assistants';

/**
 * GET /api/vapi/assistants/[id]
 * Get a single assistant with statistics
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

    // Get assistant
    const assistant = await getAssistant(id, userProfile.company_id);

    // Get statistics
    const stats = await getAssistantStats(id, userProfile.company_id);

    return createSuccessResponse({
      assistant,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/vapi/assistants/[id]:', error);

    if (error instanceof Error && error.message === 'Assistant not found') {
      return createErrorResponse('Assistant not found', 404);
    }

    return createErrorResponse('Failed to fetch assistant', 500);
  }
}

/**
 * PATCH /api/vapi/assistants/[id]
 * Update an assistant
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

    // Check permissions
    let hasPermission = userProfile.role === 'admin' || userProfile.role === 'owner';

    if (!hasPermission) {
      // Fallback: Check organization_memberships
      const { data: membership } = await supabase
        .from('organization_memberships')
        .select('role')
        .eq('user_id', user.id)
        .eq('company_id', userProfile.company_id)
        .single();
      
      if (membership && (membership.role === 'owner' || membership.role === 'admin')) {
        hasPermission = true;
      }
    }

    // Only admins can update assistants
    if (!hasPermission) {
      return createErrorResponse('Only admins can update assistants', 403);
    }

    // Validate request body
    const body = await request.json();
    const validatedData = UpdateAssistantSchema.parse(body);

    // Update assistant
    const assistant = await updateAssistant(
      id,
      userProfile.company_id,
      validatedData
    );

    return createSuccessResponse(
      { assistant },
      'Assistant updated successfully'
    );
  } catch (error) {
    console.error('Error in PATCH /api/vapi/assistants/[id]:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400);
    }

    if (error instanceof Error && error.message === 'Assistant not found') {
      return createErrorResponse('Assistant not found', 404);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Failed to update assistant', 500);
  }
}

/**
 * DELETE /api/vapi/assistants/[id]
 * Delete an assistant
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

    // Check permissions
    let hasPermission = userProfile.role === 'admin' || userProfile.role === 'owner';

    if (!hasPermission) {
      // Fallback: Check organization_memberships
      const { data: membership } = await supabase
        .from('organization_memberships')
        .select('role')
        .eq('user_id', user.id)
        .eq('company_id', userProfile.company_id)
        .single();
      
      if (membership && (membership.role === 'owner' || membership.role === 'admin')) {
        hasPermission = true;
      }
    }

    // Only admins can delete assistants
    if (!hasPermission) {
      return createErrorResponse('Only admins can delete assistants', 403);
    }

    // Delete assistant
    await deleteAssistant(id, userProfile.company_id);

    return createSuccessResponse(null, 'Assistant deleted successfully');
  } catch (error) {
    console.error('Error in DELETE /api/vapi/assistants/[id]:', error);

    if (error instanceof Error && error.message === 'Assistant not found') {
      return createErrorResponse('Assistant not found', 404);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Failed to delete assistant', 500);
  }
}
