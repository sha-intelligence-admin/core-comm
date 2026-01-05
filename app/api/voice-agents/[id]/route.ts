import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for voice agent updates
const voiceAgentUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  voice_model: z.string().optional(),
  personality: z.string().optional(),
  language: z.string().optional(),
  status: z.enum(['active', 'inactive', 'training', 'error']).optional(),
  greeting_message: z.string().optional(),
  knowledge_base_id: z.string().uuid().optional(),
  config: z.record(z.string(), z.any()).optional(),
  total_calls: z.number().optional(),
  total_minutes: z.number().optional(),
  success_rate: z.number().optional(),
})

/**
 * PUT /api/voice-agents/[id]
 * Updates an existing voice agent.
 * 
 * @param request - NextRequest object containing update data
 * @param params - Route parameters containing the voice agent ID
 * @returns JSON response with the updated voice agent or error
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
    const validatedData = voiceAgentUpdateSchema.parse(body)

    // Update voice agent
    const { data: agent, error } = await supabase
      .from('voice_agents')
      .update(validatedData)
      .eq('id', id)
      .eq('company_id', userData.company_id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Voice agent not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update voice agent' }, { status: 500 })
    }

    return NextResponse.json({ agent })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/voice-agents/[id]
 * Deletes a voice agent.
 * 
 * @param request - NextRequest object
 * @param params - Route parameters containing the voice agent ID
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

    // Delete voice agent
    const { error } = await supabase
      .from('voice_agents')
      .delete()
      .eq('id', id)
      .eq('company_id', userData.company_id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete voice agent' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Voice agent deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
