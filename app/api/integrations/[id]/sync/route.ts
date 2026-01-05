import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';
import { IntegrationFactory } from '@/lib/integrations/factory';
import { IntegrationType } from '@/lib/integrations/types';

/**
 * POST /api/integrations/[id]/sync
 * Triggers a synchronization for a specific integration.
 * 
 * @param request - NextRequest object
 * @param params - Route parameters containing the integration ID
 * @returns JSON response with sync results or error
 */
export async function POST(
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

    // Get integration
    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !integration) {
      return createErrorResponse('Integration not found', 404);
    }

    // Verify ownership (via company_id check on user)
    const { data: userProfile } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.company_id !== integration.company_id) {
      return createErrorResponse('Unauthorized', 403);
    }

    // Perform sync
    const provider = IntegrationFactory.getProvider(integration.type as IntegrationType);
    
    if (provider.sync) {
      await provider.sync(integration.config, integration.last_sync ? new Date(integration.last_sync) : undefined);
      
      // Update last_sync timestamp
      await supabase
        .from('integrations')
        .update({ last_sync: new Date().toISOString(), status: 'active', error_message: null })
        .eq('id', id);
        
      return createSuccessResponse(null, 'Sync started successfully');
    } else {
      return createErrorResponse('This integration type does not support manual sync', 400);
    }

  } catch (error) {
    console.error('Error in POST /api/integrations/[id]/sync:', error);
    return createErrorResponse('Failed to sync integration', 500);
  }
}
