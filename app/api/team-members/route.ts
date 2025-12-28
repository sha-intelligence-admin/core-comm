import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { zohoMail } from '@/lib/zoho-mail'

// Validation schema for team member creation
const teamMemberSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'agent', 'viewer', 'developer']),
  department: z.string().optional(),
  status: z.enum(['active', 'inactive', 'invited', 'suspended']).optional().default('invited'),
  
  phone_number: z.string().optional(),
  avatar_url: z.string().url().optional().nullable(),
  timezone: z.string().optional(),
  
  // Permissions
  permissions: z.record(z.string(), z.unknown()).optional().default({}),
  can_access_analytics: z.boolean().optional().default(false),
  can_manage_integrations: z.boolean().optional().default(false),
  can_manage_team: z.boolean().optional().default(false),
  can_manage_agents: z.boolean().optional().default(false),
  can_view_calls: z.boolean().optional().default(true),
  can_view_messages: z.boolean().optional().default(true),
  can_view_emails: z.boolean().optional().default(true),
  
  notes: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional().default({}),
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

    // Fetch pending invitations as well
    const { data: invitations } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('company_id', userData.company_id)
      .eq('status', 'pending')

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

    // Merge members and invitations
    const allMembers = [...(members || [])]
    
    if (invitations) {
      invitations.forEach(invite => {
        // Only add if not already in members list (by email)
        if (!allMembers.find(m => m.email === invite.email)) {
          allMembers.push({
            id: 'invite-' + invite.id,
            full_name: invite.metadata?.full_name || 'Invited User',
            email: invite.email,
            role: invite.role,
            status: 'invited',
            created_at: invite.created_at,
            department: invite.metadata?.department,
            avatar_url: null
          })
        }
      })
    }

    // Sort combined list
    allMembers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Apply pagination manually since we merged lists
    const totalItems = allMembers.length
    const paginatedMembers = allMembers.slice(from, to + 1)

    return NextResponse.json({
      members: paginatedMembers,
      pagination: {
        page,
        limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit),
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
    const email = validatedData.email.toLowerCase().trim()

    // Use Service Role to manage users
    const supabaseAdmin = createServiceRoleClient()
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || process.env.NGROK_URL || 'http://localhost:3000'
    
    let userId: string | undefined;
    let isExistingUser = false;

    let inviteLink: string | undefined;

    // 1. Check if user already exists in our public users table
    const { data: existingPublicUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()
        
    if (existingPublicUser) {
        userId = existingPublicUser.id;
        isExistingUser = true;
        
        // Generate magic link for existing user to notify them
        const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${origin}/auth/callback?next=/join`
          }
        })

        if (linkData?.properties?.action_link) {
          const actionLink = linkData.properties.action_link
          inviteLink = `${origin}/join/verify?redirect=${encodeURIComponent(actionLink)}`
          
          console.log('📧 Sending existing user invite to:', email);
          
          // Send email via Zoho
          try {
            await zohoMail.sendInvitationEmail(email, inviteLink, user.email || 'A team member', userData.company_id)
          } catch (e) {
            console.error('❌ Failed to send Zoho email:', e)
          }
        }
    } else {
        // 2. NEW USER: Create invitation record instead of creating auth user immediately
        
        // Generate a unique token for the invitation
        const invitationToken = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

        const { error: inviteError } = await supabaseAdmin
          .from('organization_invitations')
          .insert({
            company_id: userData.company_id,
            email: email,
            role: validatedData.role,
            invitation_token: invitationToken,
            expires_at: expiresAt.toISOString(),
            invited_by: user.id,
            status: 'pending',
            metadata: {
              full_name: validatedData.full_name,
              phone_number: validatedData.phone_number,
              department: validatedData.department,
              permissions: validatedData.permissions
            }
          })

        if (inviteError) {
          console.error('Error creating invitation:', inviteError)
          return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
        }

        // Generate the manual setup link
        inviteLink = `${origin}/join/accept/${invitationToken}`
        
        console.log('📧 Sending invitation email to:', email);
        console.log('🔗 Invite Link:', inviteLink);

        // Send email via Zoho
        try {
          const sent = await zohoMail.sendInvitationEmail(email, inviteLink, user.email || 'A team member', userData.company_id)
          console.log('📧 Email sent result:', sent);
        } catch (e) {
          console.error('❌ Failed to send Zoho email:', e)
        }

        // Return a mock member object so the UI updates optimistically
        return NextResponse.json({ 
          id: 'pending-' + invitationToken,
          full_name: validatedData.full_name,
          email: email,
          role: validatedData.role,
          status: 'invited',
          created_at: new Date().toISOString(),
          inviteLink,
          emailSent: true
        }, { status: 201 })
    }

    if (!userId) {
       return NextResponse.json({ error: 'Failed to obtain user ID' }, { status: 500 })
    }

    // Insert team member linked to the user
    const { data: member, error } = await supabase
      .from('team_members')
      .insert({
        ...validatedData,
        user_id: userId, 
        company_id: userData.company_id,
        created_by: user.id,
        invitation_sent_at: new Date().toISOString(),
        status: isExistingUser ? 'active' : 'invited'
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

    // Also create organization membership
    // Map team roles to organization roles
    const orgRoleMap: Record<string, string> = {
      'admin': 'admin',
      'manager': 'manager',
      'agent': 'member',
      'viewer': 'viewer',
      'developer': 'member'
    }
    const orgRole = orgRoleMap[validatedData.role] || 'member'

    const { error: membershipError } = await supabaseAdmin
      .from('organization_memberships')
      .upsert({
        user_id: userId,
        company_id: userData.company_id,
        role: orgRole,
        status: 'active',
        is_default: true // Make it default if they don't have one, but upsert handles it
      }, { onConflict: 'user_id, company_id' })

    if (membershipError) {
      console.error('Error creating organization membership:', membershipError)
      // Don't fail the request, but log it
    }

    return NextResponse.json({ 
      ...member,
      inviteLink, // Return the magic link so frontend can display "Copy Link"
      emailSent: true
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
