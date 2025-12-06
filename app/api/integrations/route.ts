import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api'
import { CreateIntegrationSchema, IntegrationsQuerySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const { page, limit, type, status, search } = IntegrationsQuerySchema.parse(queryParams)
    
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.company_id) {
      return createErrorResponse('User company not found', 403)
    }

    // Build query
    let query = supabase
      .from('integrations')
      .select('*', { count: 'exact' })
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,endpoint_url.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data: integrations, error, count } = await query

    if (error) {
      console.error('Error fetching integrations:', error)
      return createErrorResponse('Failed to fetch integrations', 500)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return createSuccessResponse({
      integrations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/integrations:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const integrationData = CreateIntegrationSchema.parse(body)
    
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.company_id) {
      return createErrorResponse('User company not found', 403)
    }

    // Add company_id to integration data
    const integrationWithCompany = {
      ...integrationData,
      company_id: userData.company_id,
    }

    const { data: integration, error } = await supabase
      .from('integrations')
      .insert(integrationWithCompany)
      .select()
      .single()

    if (error) {
      console.error('Error creating integration:', error)
      return createErrorResponse('Failed to create integration', 500)
    }

    return createSuccessResponse(integration, 'Integration created successfully')
  } catch (error) {
    console.error('Error in POST /api/integrations:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400)
    }
    return createErrorResponse('Internal server error', 500)
  }
}
