import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for team member creation
const teamMemberSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'agent', 'viewer', 'developer']),
  department: z.string().optional(),
  status: z.enum(['active', 'inactive', 'invited', 'suspended']).optional().default('invited'),
  
  phone_number: z.string().optional(),
  avatar_url: z.string().url().optional().nullable(),
  timezone: z.string().optional().default('UTC'),
  
  // Permissions
  permissions: z.record(z.unknown()).optional().default({}),
  can_access_analytics: z.boolean().optional().default(false),
  can_manage_integrations: z.boolean().optional().default(false),
  can_manage_team: z.boolean().optional().default(false),
  can_manage_agents: z.boolean().optional().default(false),
  can_view_calls: z.boolean().optional().default(true),
  can_view_messages: z.boolean().optional().default(true),
  can_view_emails: z.boolean().optional().default(true),
  
  notes: z.string().optional(),
  config: z.record(z.unknown()).optional().default({}),
})

// GET /api/team-members - List team members with pagination and filtering
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ 
        error: 'Failed to fetch user profile',
        details: 'Please complete your profile setup in Settings',
        code: 'USER_NOT_FOUND'
      }, { status: 403 })
    }

    if (!userData?.company_id) {
      console.error('User has no company_id:', user.id)
      return NextResponse.json({ 
        error: 'Company not found',
        details: 'Your account is not associated with a company. Please complete onboarding or contact support.',
        code: 'NO_COMPANY_ID',
        userId: user.id
      }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const department = searchParams.get('department')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('team_members')
      .select('*', { count: 'exact' })
      .eq('company_id', userData.company_id)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (role) {
      query = query.eq('role', role)
    }
    if (department) {
      query = query.eq('department', department)
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data: members, error, count } = await query

    if (error) {
      console.error('Error fetching team members:', error)
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
    }

    return NextResponse.json({
      members: members || [],
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

// POST /api/team-members - Create a new team member
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
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

    const body = await request.json()
    
    // Validate request body
    const validatedData = teamMemberSchema.parse(body)

    // Insert team member
    const { data: member, error } = await supabase
      .from('team_members')
      .insert({
        ...validatedData,
        company_id: userData.company_id,
        created_by: user.id,
        invitation_sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A team member with this email already exists' }, { status: 409 })
      }
      console.error('Error creating team member:', error)
      return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
    }

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
