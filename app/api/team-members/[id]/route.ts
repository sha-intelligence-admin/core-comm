import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for team member updates
const updateTeamMemberSchema = z.object({
  full_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'manager', 'agent', 'viewer', 'developer']).optional(),
  department: z.string().optional(),
  status: z.enum(['active', 'inactive', 'invited', 'suspended']).optional(),
  
  phone_number: z.string().optional(),
  avatar_url: z.string().url().optional().nullable(),
  timezone: z.string().optional(),
  
  // Permissions
  permissions: z.record(z.unknown()).optional(),
  can_access_analytics: z.boolean().optional(),
  can_manage_integrations: z.boolean().optional(),
  can_manage_team: z.boolean().optional(),
  can_manage_agents: z.boolean().optional(),
  can_view_calls: z.boolean().optional(),
  can_view_messages: z.boolean().optional(),
  can_view_emails: z.boolean().optional(),
  
  notes: z.string().optional(),
  config: z.record(z.unknown()).optional(),
})

// PUT /api/team-members/[id] - Update a team member
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    
    // Validate request body
    const validatedData = updateTeamMemberSchema.parse(body)

    // Update team member
    const { data: member, error } = await supabase
      .from('team_members')
      .update(validatedData)
      .eq('id', id)
      .eq('company_id', userData.company_id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
      }
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A team member with this email already exists' }, { status: 409 })
      }
      console.error('Error updating team member:', error)
      return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
    }

    return NextResponse.json(member)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/team-members/[id] - Delete a team member
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Delete team member
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)
      .eq('company_id', userData.company_id)

    if (error) {
      console.error('Error deleting team member:', error)
      return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
