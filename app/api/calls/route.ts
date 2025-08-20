import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient, createErrorResponse, createSuccessResponse } from '@/lib/supabase/api'
import { CreateCallSchema, CallsQuerySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const { page, limit, resolution_status, call_type, priority, search } = CallsQuerySchema.parse(queryParams)
    
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Build query
    let query = supabase
      .from('calls')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (resolution_status) {
      query = query.eq('resolution_status', resolution_status)
    }
    if (call_type) {
      query = query.eq('call_type', call_type)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (search) {
      query = query.or(`caller_number.ilike.%${search}%,transcript.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data: calls, error, count } = await query

    if (error) {
      console.error('Error fetching calls:', error)
      return createErrorResponse('Failed to fetch calls', 500)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return createSuccessResponse({
      calls,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/calls:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const callData = CreateCallSchema.parse(body)
    
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Add user_id to call data
    const callWithUser = {
      ...callData,
      user_id: user.id,
    }

    const { data: call, error } = await supabase
      .from('calls')
      .insert(callWithUser)
      .select()
      .single()

    if (error) {
      console.error('Error creating call:', error)
      return createErrorResponse('Failed to create call', 500)
    }

    return createSuccessResponse(call, 'Call created successfully')
  } catch (error) {
    console.error('Error in POST /api/calls:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400)
    }
    return createErrorResponse('Internal server error', 500)
  }
}
