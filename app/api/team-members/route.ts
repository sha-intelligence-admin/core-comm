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
    const email = validatedData.email.toLowerCase().trim()

    // Use Service Role to manage users
    const supabaseAdmin = createServiceRoleClient()
    const origin = request.headers.get('origin') || ''
    
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
          // Send email via Zoho
          try {
            await zohoMail.sendInvitationEmail(email, inviteLink, user.email || 'A team member')
          } catch (e) {
            console.error('Failed to send Zoho email:', e)
          }
        }
    } else {
        // 2. Create user and generate link (don't use inviteUserByEmail to avoid Supabase email)
        // We use generateLink with type 'invite' or 'magiclink'
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          email_confirm: true, // Auto confirm so they can login with magic link
          user_metadata: {
            company_id: userData.company_id,
            role: validatedData.role,
            full_name: validatedData.full_name,
          }
        })

        if (createError) {
           // If error is "email exists", handle it (though we checked public table, auth table might have it)
           if (createError.message.includes('already been registered') || createError.code === 'email_exists') {
              // Fallback to existing user logic
              const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                 type: 'magiclink',
                 email: email,
                 options: { redirectTo: `${origin}/auth/callback?next=/join` }
             });
             
             if (linkError || !linkData.user) {
                  return NextResponse.json({ error: 'User exists but could not be invited.' }, { status: 400 });
             }
             userId = linkData.user.id;
             isExistingUser = true;
             if (linkData.properties?.action_link) {
                inviteLink = `${origin}/join/verify?redirect=${encodeURIComponent(linkData.properties.action_link)}`
             }
           } else {
             console.error('Error creating user:', createError)
             return NextResponse.json({ error: createError.message }, { status: 400 })
           }
        } else {
           userId = newUser.user.id
           
           // Generate the invite link
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
           }
        }

        // Send email via Zoho if we have a link
        if (inviteLink) {
           try {
             await zohoMail.sendInvitationEmail(email, inviteLink, user.email || 'A team member')
           } catch (e) {
             console.error('Failed to send Zoho email:', e)
           }
        }
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
