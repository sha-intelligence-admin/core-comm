import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for voice agent
const voiceAgentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  voice_model: z.string().default('en-US-neural'),
  personality: z.string().optional(),
  language: z.string().default('en-US'),
  status: z.enum(['active', 'inactive', 'training', 'error']).default('active'),
  greeting_message: z.string().optional(),
  knowledge_base_id: z.string().uuid().optional(),
  config: z.record(z.any()).default({}),
})

// GET /api/voice-agents - List voice agents with pagination and filters
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
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('voice_agents')
      .select('*', { count: 'exact' })
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: agents, error, count } = await query

    if (error) {
      console.error('Error fetching voice agents:', error)
      return NextResponse.json({ error: 'Failed to fetch voice agents' }, { status: 500 })
    }

    return NextResponse.json({
      agents: agents || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/voice-agents - Create new voice agent
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
    const validatedData = voiceAgentSchema.parse(body)

    // Insert voice agent
    const { data: agent, error } = await supabase
      .from('voice_agents')
      .insert({
        ...validatedData,
        company_id: userData.company_id,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating voice agent:', error)
      return NextResponse.json({ error: 'Failed to create voice agent' }, { status: 500 })
    }

    return NextResponse.json({ agent }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
