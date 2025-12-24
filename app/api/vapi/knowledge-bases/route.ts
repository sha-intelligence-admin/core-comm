import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';
import { CreateKnowledgeBaseSchema } from '@/lib/validations';
import {
  createKnowledgeBase,
  listKnowledgeBases,
} from '@/lib/vapi/knowledge-bases';

/**
 * GET /api/vapi/knowledge-bases
 * List all knowledge bases for the user's company
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

    // List knowledge bases
    const knowledgeBases = await listKnowledgeBases(userProfile.company_id);

    return createSuccessResponse({ knowledgeBases });
  } catch (error) {
    console.error('Error in GET /api/vapi/knowledge-bases:', error);
    return createErrorResponse('Failed to fetch knowledge bases', 500);
  }
}

/**
 * POST /api/vapi/knowledge-bases
 * Create a new knowledge base
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

    // Only admins can create knowledge bases
    if (!hasPermission) {
      return createErrorResponse('Only admins can create knowledge bases', 403);
    }

    // Validate request body
    const body = await request.json();
    const validatedData = CreateKnowledgeBaseSchema.parse(body);

    // Create knowledge base
    const knowledgeBase = await createKnowledgeBase(
      userProfile.company_id,
      validatedData
    );

    return createSuccessResponse(
      { knowledgeBase },
      'Knowledge base created successfully'
    );
  } catch (error) {
    console.error('Error in POST /api/vapi/knowledge-bases:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Failed to create knowledge base', 500);
  }
}
