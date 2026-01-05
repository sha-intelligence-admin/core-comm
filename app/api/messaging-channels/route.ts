import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for messaging channel
const messagingChannelSchema = z.object({
  channel_name: z.string().min(1).max(255),
  channel_type: z.enum(['whatsapp', 'telegram', 'messenger', 'slack', 'discord', 'sms', 'webchat']),
  provider: z.string().default('twilio'),
  status: z.enum(['active', 'inactive', 'suspended', 'pending', 'error']).default('active'),
  phone_number: z.string().optional(),
  api_key: z.string().optional(),
  webhook_url: z.string().url().optional(),
  config: z.record(z.string(), z.unknown()).default({}),
})

/**
 * GET /api/messaging-channels
 * Lists messaging channels with pagination and filtering.
 * 
 * @param request - NextRequest object containing query parameters
 * @returns JSON response with list of channels and pagination metadata
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.company_id) {
      return NextResponse.json({ error: 'User company not found' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const channelType = searchParams.get('channel_type')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('messaging_channels')
      .select('*', { count: 'exact' })
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (channelType) {
      query = query.eq('channel_type', channelType)
    }

    if (search) {
      query = query.or(`channel_name.ilike.%${search}%,phone_number.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: channels, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch messaging channels' }, { status: 500 })
    }

    return NextResponse.json({
      channels: channels || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/messaging-channels
 * Creates a new messaging channel.
 * 
 * @param request - NextRequest object containing channel configuration
 * @returns JSON response with the created channel or error
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.company_id) {
      return NextResponse.json({ error: 'User company not found' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = messagingChannelSchema.parse(body)

    // Insert messaging channel
    const { data: channel, error } = await supabase
      .from('messaging_channels')
      .insert({
        ...validatedData,
        company_id: userData.company_id,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create messaging channel' }, { status: 500 })
    }

    return NextResponse.json({ channel }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
