import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { zohoMail } from '@/lib/zoho-mail'

const resendSchema = z.object({
  email: z.string().email(),
})

/**
 * POST /api/team-members/resend
 * Resends an invitation email to a team member.
 * 
 * @param request - Request object containing the email address
 * @returns JSON response with success status or error
 */
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
    const { email } = resendSchema.parse(body)

    // Verify the user belongs to this company and is in 'invited' status
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select('*')
      .eq('company_id', userData.company_id)
      .eq('email', email)
      .eq('status', 'invited')
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found or already active' }, { status: 404 })
    }

    // Use Service Role to resend invite
    const supabaseAdmin = createServiceRoleClient()
    const origin = request.headers.get('origin') || ''
    
    // Generate a new link for "Copy Link" functionality
    let inviteLink: string | undefined;
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${origin}/auth/callback?next=/join`
      }
    })
    
    if (linkData?.properties?.action_link) {
      inviteLink = linkData.properties.action_link
      
      // Send email via Zoho
      try {
        await zohoMail.sendInvitationEmail(email, inviteLink, user.email || 'A team member', userData.company_id)
      } catch (e) {
        console.error('Failed to send Zoho email:', e)
      }
    }

    // Update invitation_sent_at
    await supabase
      .from('team_members')
      .update({ invitation_sent_at: new Date().toISOString() })
      .eq('id', member.id)

    return NextResponse.json({ success: true, inviteLink }, { status: 200 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
