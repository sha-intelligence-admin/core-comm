import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';
import { UpdateKnowledgeBaseSchema } from '@/lib/validations';
import {
  getKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
} from '@/lib/vapi/knowledge-bases';

/**
 * GET /api/vapi/knowledge-bases/[id]
 * Get a single knowledge base with its files
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

    // Get knowledge base
    const knowledgeBase = await getKnowledgeBase(id, userProfile.company_id);

    return createSuccessResponse({ knowledgeBase });
  } catch (error) {
    console.error('Error in GET /api/vapi/knowledge-bases/[id]:', error);

    if (error instanceof Error && error.message === 'Knowledge base not found') {
      return createErrorResponse('Knowledge base not found', 404);
    }

    return createErrorResponse('Failed to fetch knowledge base', 500);
  }
}

/**
 * PATCH /api/vapi/knowledge-bases/[id]
 * Update a knowledge base
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

    // Only admins can update knowledge bases
    if (!hasPermission) {
      return createErrorResponse('Only admins can update knowledge bases', 403);
    }

    // Validate request body
    const body = await request.json();
    const validatedData = UpdateKnowledgeBaseSchema.parse(body);

    // Update knowledge base
    const knowledgeBase = await updateKnowledgeBase(
      id,
      userProfile.company_id,
      validatedData
    );

    return createSuccessResponse(
      { knowledgeBase },
      'Knowledge base updated successfully'
    );
  } catch (error) {
    console.error('Error in PATCH /api/vapi/knowledge-bases/[id]:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400);
    }

    if (error instanceof Error && error.message === 'Knowledge base not found') {
      return createErrorResponse('Knowledge base not found', 404);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Failed to update knowledge base', 500);
  }
}

/**
 * DELETE /api/vapi/knowledge-bases/[id]
 * Delete a knowledge base and all its files
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

    // Only admins can delete knowledge bases
    if (!hasPermission) {
      return createErrorResponse('Only admins can delete knowledge bases', 403);
    }

    // Delete knowledge base
    await deleteKnowledgeBase(id, userProfile.company_id);

    return createSuccessResponse(null, 'Knowledge base deleted successfully');
  } catch (error) {
    console.error('Error in DELETE /api/vapi/knowledge-bases/[id]:', error);

    if (error instanceof Error && error.message === 'Knowledge base not found') {
      return createErrorResponse('Knowledge base not found', 404);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Failed to delete knowledge base', 500);
  }
}
