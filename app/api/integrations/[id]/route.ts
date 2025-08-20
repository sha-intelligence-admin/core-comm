import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api'
import { UpdateIntegrationSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { data: integration, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching integration:', error)
      return createErrorResponse('Integration not found', 404)
    }

    return createSuccessResponse(integration)
  } catch (error) {
    console.error('Error in GET /api/integrations/[id]:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Validate request body
    const updateData = UpdateIntegrationSchema.parse(body)
    
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { data: integration, error } = await supabase
      .from('integrations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating integration:', error)
      return createErrorResponse('Failed to update integration', 500)
    }

    return createSuccessResponse(integration, 'Integration updated successfully')
  } catch (error) {
    console.error('Error in PUT /api/integrations/[id]:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400)
    }
    return createErrorResponse('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting integration:', error)
      return createErrorResponse('Failed to delete integration', 500)
    }

    return createSuccessResponse(null, 'Integration deleted successfully')
  } catch (error) {
    console.error('Error in DELETE /api/integrations/[id]:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
