import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { checkProvisioningLimit } from '@/lib/billing/usage-tracker'

// Validation schema for phone number
const phoneNumberSchema = z.object({
  phone_number: z.string().min(10).max(20),
  country_code: z.string().default('+1'),
  provider: z.string().default('twilio'),
  number_type: z.enum(['voice', 'sms', 'both']).default('both'),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).default('active'),
  friendly_name: z.string().optional(),
  capabilities: z.object({
    voice: z.boolean().default(true),
    sms: z.boolean().default(true),
    mms: z.boolean().default(false),
  }).default({ voice: true, sms: true, mms: false }),
  assigned_to: z.string().optional(),
  monthly_cost: z.number().default(0),
  config: z.record(z.string(), z.unknown()).default({}),
})

/**
 * GET /api/phone-numbers
 * Lists phone numbers with pagination and filtering.
 * 
 * @param request - NextRequest object containing query parameters
 * @returns JSON response with list of phone numbers and pagination metadata
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
    const provider = searchParams.get('provider')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('phone_numbers')
      .select('*', { count: 'exact' })
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (provider) {
      query = query.eq('provider', provider)
    }

    if (search) {
      query = query.or(`phone_number.ilike.%${search}%,friendly_name.ilike.%${search}%,assigned_to.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: phoneNumbers, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch phone numbers' }, { status: 500 })
    }

    return NextResponse.json({
      phoneNumbers: phoneNumbers || [],
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

// POST /api/phone-numbers - Create new phone number
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
    const validatedData = phoneNumberSchema.parse(body)

    // Check Provisioning Limits
    const limitCheck = await checkProvisioningLimit(userData.company_id, 'phone_numbers');
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: 'Phone number limit reached', 
        details: `You have used ${limitCheck.current} of ${limitCheck.limit} allowed phone numbers. Upgrade your plan or purchase an add-on.` 
      }, { status: 403 })
    }

    // Check if phone number already exists
    const { data: existing } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('phone_number', validatedData.phone_number)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Phone number already exists' }, { status: 409 })
    }

    // Insert phone number
    const { data: phoneNumber, error } = await supabase
      .from('phone_numbers')
      .insert({
        ...validatedData,
        company_id: userData.company_id,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create phone number' }, { status: 500 })
    }

    return NextResponse.json({ phoneNumber }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
