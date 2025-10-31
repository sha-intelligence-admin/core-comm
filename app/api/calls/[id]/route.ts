import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api'
import { UpdateCallSchema } from '@/lib/validations'

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

    // Get user's company_id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.company_id) {
      return createErrorResponse('User not associated with a company', 403)
    }

    const { data: call, error } = await supabase
      .from('calls')
      .select('*')
      .eq('id', id)
      .eq('company_id', userProfile.company_id)
      .single()

    if (error) {
      console.error('Error fetching call:', error)
      return createErrorResponse('Call not found', 404)
    }

    return createSuccessResponse(call)
  } catch (error) {
    console.error('Error in GET /api/calls/[id]:', error)
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
    const updateData = UpdateCallSchema.parse(body)

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get user's company_id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.company_id) {
      return createErrorResponse('User not associated with a company', 403)
    }

    const { data: call, error } = await supabase
      .from('calls')
      .update(updateData)
      .eq('id', id)
      .eq('company_id', userProfile.company_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating call:', error)
      return createErrorResponse('Failed to update call', 500)
    }

    return createSuccessResponse(call, 'Call updated successfully')
  } catch (error) {
    console.error('Error in PUT /api/calls/[id]:', error)
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

    // Get user's company_id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.company_id) {
      return createErrorResponse('User not associated with a company', 403)
    }

    const { error } = await supabase
      .from('calls')
      .delete()
      .eq('id', id)
      .eq('company_id', userProfile.company_id)

    if (error) {
      console.error('Error deleting call:', error)
      return createErrorResponse('Failed to delete call', 500)
    }

    return createSuccessResponse(null, 'Call deleted successfully')
  } catch (error) {
    console.error('Error in DELETE /api/calls/[id]:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
