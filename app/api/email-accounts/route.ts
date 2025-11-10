import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for email account creation
const emailAccountSchema = z.object({
  account_name: z.string().min(1, 'Account name is required'),
  email_address: z.string().email('Invalid email address'),
  provider: z.enum(['gmail', 'outlook', 'exchange', 'imap', 'smtp', 'other']),
  status: z.enum(['active', 'inactive', 'suspended', 'error', 'pending']).optional().default('active'),
  
  // SMTP Configuration
  smtp_host: z.string().optional(),
  smtp_port: z.number().int().min(1).max(65535).optional(),
  smtp_username: z.string().optional(),
  smtp_password: z.string().optional(),
  smtp_use_tls: z.boolean().optional().default(true),
  
  // IMAP Configuration
  imap_host: z.string().optional(),
  imap_port: z.number().int().min(1).max(65535).optional(),
  imap_username: z.string().optional(),
  imap_password: z.string().optional(),
  imap_use_tls: z.boolean().optional().default(true),
  
  // OAuth Configuration
  oauth_provider: z.string().optional(),
  oauth_access_token: z.string().optional(),
  oauth_refresh_token: z.string().optional(),
  
  // Additional settings
  signature: z.string().optional(),
  auto_reply_enabled: z.boolean().optional().default(false),
  auto_reply_message: z.string().optional(),
  forward_to_email: z.string().email().optional().nullable(),
  config: z.record(z.string(), z.unknown()).optional().default({}),
})

// GET /api/email-accounts - List email accounts with pagination and filtering
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

    if (userError || !userData?.company_id) {
      return NextResponse.json({ error: 'User company not found' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const provider = searchParams.get('provider')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('email_accounts')
      .select('*', { count: 'exact' })
      .eq('company_id', userData.company_id)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (provider) {
      query = query.eq('provider', provider)
    }
    if (search) {
      query = query.or(`account_name.ilike.%${search}%,email_address.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data: accounts, error, count } = await query

    if (error) {
      console.error('Error fetching email accounts:', error)
      return NextResponse.json({ error: 'Failed to fetch email accounts' }, { status: 500 })
    }

    return NextResponse.json({
      accounts: accounts || [],
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

// POST /api/email-accounts - Create a new email account
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
    const validatedData = emailAccountSchema.parse(body)

    // Insert email account
    const { data: account, error } = await supabase
      .from('email_accounts')
      .insert({
        ...validatedData,
        company_id: userData.company_id,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating email account:', error)
      return NextResponse.json({ error: 'Failed to create email account' }, { status: 500 })
    }

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
