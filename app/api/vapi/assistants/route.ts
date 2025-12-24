import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';
import { CreateAssistantSchema } from '@/lib/validations';
import {
  createAssistant,
  listAssistants,
} from '@/lib/vapi/assistants';

/**
 * GET /api/vapi/assistants
 * List all assistants for the user's company
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

    // List assistants
    const assistants = await listAssistants(userProfile.company_id);

    return createSuccessResponse({ assistants });
  } catch (error) {
    console.error('Error in GET /api/vapi/assistants:', error);
    return createErrorResponse('Failed to fetch assistants', 500);
  }
}

/**
 * POST /api/vapi/assistants
 * Create a new voice assistant
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

    // Only admins can create assistants
    if (!hasPermission) {
      return createErrorResponse('Only admins can create assistants', 403);
    }

    // Validate request body
    const body = await request.json();
    const validatedData = CreateAssistantSchema.parse(body);

    // Create assistant
    const assistant = await createAssistant(userProfile.company_id, {
      name: validatedData.name,
      description: validatedData.description,
      systemPrompt: validatedData.systemPrompt,
      firstMessage: validatedData.firstMessage,
      language: validatedData.language,
      model: validatedData.model,
      voice: validatedData.voice,
      knowledgeBaseId: validatedData.knowledgeBaseId,
    });

    return createSuccessResponse(
      { assistant },
      'Assistant created successfully'
    );
  } catch (error) {
    console.error('Error in POST /api/vapi/assistants:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Failed to create assistant', 500);
  }
}
