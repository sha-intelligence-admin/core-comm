import { NextRequest } from 'next/server'
import { createServiceRoleClient, createErrorResponse, createSuccessResponse } from '@/lib/supabase/api'

/**
 * Vapi Webhook Handler
 * Receives real-time events from Vapi during and after phone calls
 *
 * Event types:
 * - assistant-request: When a call starts, returns assistant configuration
 * - status-update: Real-time call status updates
 * - end-of-call-report: Final call report with transcript and metadata
 * - function-call: When assistant calls a custom function
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    console.log('Vapi webhook received:', message?.type || 'unknown')

    // Verify webhook signature (implement when Vapi provides webhook secret)
    // const signature = request.headers.get('x-vapi-signature')
    // if (!verifyWebhookSignature(body, signature)) {
    //   return createErrorResponse('Invalid webhook signature', 401)
    // }

    switch (message?.type) {
      case 'assistant-request':
        return handleAssistantRequest(body)

      case 'status-update':
        return handleStatusUpdate(body)

      case 'end-of-call-report':
        return handleEndOfCallReport(body)

      case 'function-call':
        return handleFunctionCall(body)

      default:
        console.log('Unknown Vapi event type:', message?.type)
        return createSuccessResponse({ received: true })
    }
  } catch (error) {
    console.error('Vapi webhook error:', error)
    return createErrorResponse('Webhook processing failed', 500)
  }
}

/**
 * Handle assistant-request event
 * Return assistant configuration for the incoming call
 */
async function handleAssistantRequest(body: any) {
  const { call } = body.message

  // TODO: Fetch company-specific assistant configuration from database
  // For now, return a default assistant config

  const assistantConfig = {
    model: {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
    },
    voice: {
      provider: 'elevenlabs',
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Example voice ID
    },
    firstMessage: 'Hello! Thank you for calling. How can I help you today?',
    // Add more configuration as needed
  }

  return createSuccessResponse({ assistant: assistantConfig })
}

/**
 * Handle status-update event
 * Update call status in real-time
 */
async function handleStatusUpdate(body: any) {
  const { call, status } = body.message

  // TODO: Update call status in database if needed
  console.log('Call status update:', call?.id, status)

  return createSuccessResponse({ received: true })
}

/**
 * Handle end-of-call-report event
 * Store final call data in database
 */
async function handleEndOfCallReport(body: any) {
  try {
    const { call, transcript, summary, analysis } = body.message

    const supabase = createServiceRoleClient()

    // TODO: Map call to company_id based on phone number or other identifier
    // For now, store without company association

    const callData = {
      caller_number: call?.customer?.number || 'Unknown',
      recipient_number: call?.phoneNumber?.number || '',
      duration: call?.endedAt && call?.startedAt
        ? Math.floor((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
        : 0,
      transcript: transcript ? JSON.stringify(transcript) : null,
      summary: summary || null,
      sentiment: analysis?.sentiment || null,
      resolution_status: 'pending',
      call_type: 'inbound',
      priority: 'medium',
      // company_id: Will be set once we implement phone number -> company mapping
    }

    const { data, error } = await supabase
      .from('calls')
      .insert(callData)
      .select()
      .single()

    if (error) {
      console.error('Error storing call:', error)
      return createErrorResponse('Failed to store call data', 500)
    }

    console.log('Call stored successfully:', data.id)
    return createSuccessResponse({ callId: data.id })
  } catch (error) {
    console.error('Error in end-of-call-report handler:', error)
    return createErrorResponse('Failed to process call report', 500)
  }
}

/**
 * Handle function-call event
 * Execute custom functions called by the assistant
 */
async function handleFunctionCall(body: any) {
  const { functionCall } = body.message
  const { name, parameters } = functionCall || {}

  console.log('Function call:', name, parameters)

  // TODO: Implement custom function handlers
  // Example:
  // switch (name) {
  //   case 'lookup_order':
  //     return handleOrderLookup(parameters)
  //   case 'schedule_callback':
  //     return handleScheduleCallback(parameters)
  //   default:
  //     return createErrorResponse('Unknown function', 400)
  // }

  return createSuccessResponse({
    result: 'Function execution not yet implemented'
  })
}
