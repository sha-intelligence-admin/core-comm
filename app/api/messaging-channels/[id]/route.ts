import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for messaging channel updates
const messagingChannelUpdateSchema = z.object({
  channel_name: z.string().min(1).max(255).optional(),
  channel_type: z.enum(['whatsapp', 'telegram', 'messenger', 'slack', 'discord', 'sms', 'webchat']).optional(),
  provider: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending', 'error']).optional(),
  phone_number: z.string().optional(),
  api_key: z.string().optional(),
  webhook_url: z.string().url().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  total_messages_sent: z.number().optional(),
  total_messages_received: z.number().optional(),
  total_conversations: z.number().optional(),
  response_rate: z.number().optional(),
  avg_response_time: z.number().optional(),
})

/**
 * PUT /api/messaging-channels/[id]
 * Updates an existing messaging channel.
 * 
 * @param request - NextRequest object containing update data
 * @param params - Route parameters containing the channel ID
 * @returns JSON response with the updated channel or error
 */
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
    const validatedData = messagingChannelUpdateSchema.parse(body)

    // Update messaging channel
    const { data: channel, error } = await supabase
      .from('messaging_channels')
      .update(validatedData)
      .eq('id', id)
      .eq('company_id', userData.company_id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Messaging channel not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update messaging channel' }, { status: 500 })
    }

    return NextResponse.json({ channel })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/messaging-channels/[id]
 * Deletes a messaging channel.
 * 
 * @param request - NextRequest object
 * @param params - Route parameters containing the channel ID
 * @returns JSON response with success message or error
 */
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

    // Delete messaging channel
    const { error } = await supabase
      .from('messaging_channels')
      .delete()
      .eq('id', id)
      .eq('company_id', userData.company_id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete messaging channel' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Messaging channel deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
