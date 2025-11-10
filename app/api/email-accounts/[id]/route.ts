import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for email account updates
const updateEmailAccountSchema = z.object({
  account_name: z.string().min(1).optional(),
  email_address: z.string().email().optional(),
  provider: z.enum(['gmail', 'outlook', 'exchange', 'imap', 'smtp', 'other']).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'error', 'pending']).optional(),
  
  // SMTP Configuration
  smtp_host: z.string().optional(),
  smtp_port: z.number().int().min(1).max(65535).optional(),
  smtp_username: z.string().optional(),
  smtp_password: z.string().optional(),
  smtp_use_tls: z.boolean().optional(),
  
  // IMAP Configuration
  imap_host: z.string().optional(),
  imap_port: z.number().int().min(1).max(65535).optional(),
  imap_username: z.string().optional(),
  imap_password: z.string().optional(),
  imap_use_tls: z.boolean().optional(),
  
  // OAuth Configuration
  oauth_provider: z.string().optional(),
  oauth_access_token: z.string().optional(),
  oauth_refresh_token: z.string().optional(),
  
  // Additional settings
  signature: z.string().optional(),
  auto_reply_enabled: z.boolean().optional(),
  auto_reply_message: z.string().optional(),
  forward_to_email: z.string().email().optional().nullable(),
  config: z.record(z.unknown()).optional(),
})

// PUT /api/email-accounts/[id] - Update an email account
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
    const validatedData = updateEmailAccountSchema.parse(body)

    // Update email account
    const { data: account, error } = await supabase
      .from('email_accounts')
      .update(validatedData)
      .eq('id', id)
      .eq('company_id', userData.company_id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Email account not found' }, { status: 404 })
      }
      console.error('Error updating email account:', error)
      return NextResponse.json({ error: 'Failed to update email account' }, { status: 500 })
    }

    return NextResponse.json(account)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/email-accounts/[id] - Delete an email account
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

    // Delete email account
    const { error } = await supabase
      .from('email_accounts')
      .delete()
      .eq('id', id)
      .eq('company_id', userData.company_id)

    if (error) {
      console.error('Error deleting email account:', error)
      return NextResponse.json({ error: 'Failed to delete email account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
