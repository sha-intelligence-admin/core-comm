import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for phone number updates
const phoneNumberUpdateSchema = z.object({
  phone_number: z.string().min(10).max(20).optional(),
  country_code: z.string().optional(),
  provider: z.string().optional(),
  number_type: z.enum(['voice', 'sms', 'both']).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
  friendly_name: z.string().optional(),
  capabilities: z.object({
    voice: z.boolean(),
    sms: z.boolean(),
    mms: z.boolean(),
  }).optional(),
  assigned_to: z.string().optional(),
  monthly_cost: z.number().optional(),
  total_inbound_calls: z.number().optional(),
  total_outbound_calls: z.number().optional(),
  total_sms_sent: z.number().optional(),
  total_sms_received: z.number().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
})

// PUT /api/phone-numbers/[id] - Update phone number
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Parse and validate request body
    const body = await request.json()
    const validatedData = phoneNumberUpdateSchema.parse(body)

    // Update phone number
    const { data: phoneNumber, error } = await supabase
      .from('phone_numbers')
      .update(validatedData)
      .eq('id', id)
      .eq('company_id', userData.company_id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Phone number not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update phone number' }, { status: 500 })
    }

    return NextResponse.json({ phoneNumber })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/phone-numbers/[id] - Delete phone number
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Delete phone number
    const { error } = await supabase
      .from('phone_numbers')
      .delete()
      .eq('id', id)
      .eq('company_id', userData.company_id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete phone number' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Phone number deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
