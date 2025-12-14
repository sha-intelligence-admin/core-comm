import { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';
import type { WebhookPayload } from '@/lib/vapi/types';

/**
 * POST /api/webhooks/vapi
 * Handle Vapi webhook events
 *
 * Events:
 * - assistant-request: Vapi requesting assistant config for incoming call
 * - status-update: Call status changes
 * - end-of-call-report: Call completed with full details
 * - function-call: Custom function invocation
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (recommended in production)
    const signature = request.headers.get('x-vapi-signature');
    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      // TODO: Implement signature verification
      // const isValid = await verifyWebhookSignature(request, signature, webhookSecret);
      // if (!isValid) {
      //   return createErrorResponse('Invalid webhook signature', 401);
      // }
    }

    // Parse webhook payload
    const payload: WebhookPayload = await request.json();
    const { message } = payload;

    console.log('[Vapi Webhook] Received event:', message.type);

    // Handle different event types
    switch (message.type) {
      case 'assistant-request':
        return handleAssistantRequest(message);

      case 'status-update':
        return handleStatusUpdate(message);

      case 'end-of-call-report':
        return handleEndOfCallReport(message);

      case 'function-call':
        return handleFunctionCall(message);

      case 'transcript':
        return handleTranscript(message);

      default:
        console.log('[Vapi Webhook] Unknown event type:', message.type);
        return createSuccessResponse({ received: true });
    }
  } catch (error) {
    console.error('[Vapi Webhook] Error processing webhook:', error);
    return createErrorResponse('Webhook processing failed', 500);
  }
}

/**
 * Handle assistant-request event
 * Called when Vapi needs assistant configuration for an incoming call
 */
async function handleAssistantRequest(message: any) {
  try {
    const { call } = message;
    const phoneNumber = call?.phoneNumber?.number;

    if (!phoneNumber) {
      console.error('[Vapi Webhook] No phone number in assistant request');
      return createErrorResponse('Phone number required', 400);
    }

    const supabase = createServiceRoleClient();

    // Find assistant by phone number
    const { data: phoneNumbers, error: phoneError } = await supabase
      .from('vapi_phone_numbers')
      .select(`
        assistant_id,
        company_id,
        vapi_assistants (
          vapi_assistant_id,
          name,
          system_prompt,
          first_message,
          model_config,
          voice_config
        )
      `)
      .eq('phone_number', phoneNumber)
      .eq('is_active', true)
      .single();

    if (phoneError || !phoneNumbers || !phoneNumbers.vapi_assistants) {
      console.error('[Vapi Webhook] Assistant not found for phone:', phoneNumber);
      return createErrorResponse('Assistant not configured for this number', 404);
    }

    const assistant = phoneNumbers.vapi_assistants as any;

    // Return assistant configuration
    return createSuccessResponse({
      assistant: {
        model: assistant.model_config,
        voice: assistant.voice_config,
        firstMessage: assistant.first_message,
        messages: [
          {
            role: 'system',
            content: assistant.system_prompt,
          },
        ],
      },
    });
  } catch (error) {
    console.error('[Vapi Webhook] Error handling assistant request:', error);
    return createErrorResponse('Failed to retrieve assistant configuration', 500);
  }
}

/**
 * Handle status-update event
 * Called when call status changes (ringing, in-progress, ended, etc.)
 */
async function handleStatusUpdate(message: any) {
  try {
    const { call } = message;
    const supabase = createServiceRoleClient();

    console.log('[Vapi Webhook] Status update:', {
      callId: call?.id,
      status: call?.status,
    });

    // Update or create call record
    if (call?.id) {
      const { data: existingCall } = await supabase
        .from('calls')
        .select('id')
        .eq('vapi_call_id', call.id)
        .single();

      if (existingCall) {
        // Update existing call
        await supabase
          .from('calls')
          .update({
            resolution_status: mapVapiStatusToResolution(call.status),
            updated_at: new Date().toISOString(),
          })
          .eq('vapi_call_id', call.id);
      } else if (call.status === 'ringing' || call.status === 'in-progress') {
        // Create new call record for incoming calls
        const phoneNumber = call.phoneNumber?.number;
        const customerNumber = call.customer?.number;

        if (phoneNumber) {
          // Get company_id and assistant_id from phone number
          const { data: phoneData } = await supabase
            .from('vapi_phone_numbers')
            .select('company_id, assistant_id, vapi_assistants(vapi_assistant_id)')
            .eq('phone_number', phoneNumber)
            .single();

          if (phoneData) {
            await supabase.from('calls').insert({
              vapi_call_id: call.id,
              company_id: phoneData.company_id,
              vapi_assistant_id: (phoneData.vapi_assistants as any)?.vapi_assistant_id,
              caller_number: customerNumber || 'Unknown',
              recipient_number: phoneNumber,
              call_type: 'inbound',
              resolution_status: 'pending',
              priority: 'medium',
            });
          }
        }
      }
    }

    return createSuccessResponse({ received: true });
  } catch (error) {
    console.error('[Vapi Webhook] Error handling status update:', error);
    return createSuccessResponse({ received: true }); // Don't fail webhook
  }
}

/**
 * Handle end-of-call-report event
 * Called when call ends with full transcript and analytics
 */
async function handleEndOfCallReport(message: any) {
  try {
    const { call, transcript, summary, recording } = message;
    const supabase = createServiceRoleClient();

    console.log('[Vapi Webhook] End of call report:', {
      callId: call?.id,
      duration: call?.duration,
    });

    if (!call?.id) {
      console.error('[Vapi Webhook] No call ID in end-of-call report');
      return createSuccessResponse({ received: true });
    }

    // Get phone number info to find company
    const phoneNumber = call.phoneNumber?.number;
    const customerNumber = call.customer?.number;

    let companyId = null;
    let assistantId = null;

    if (phoneNumber) {
      const { data: phoneData } = await supabase
        .from('vapi_phone_numbers')
        .select('company_id, assistant_id, vapi_assistants(vapi_assistant_id)')
        .eq('phone_number', phoneNumber)
        .single();

      if (phoneData) {
        companyId = phoneData.company_id;
        assistantId = (phoneData.vapi_assistants as any)?.vapi_assistant_id;
      }
    }

    // Check if call record exists
    const { data: existingCall } = await supabase
      .from('calls')
      .select('id')
      .eq('vapi_call_id', call.id)
      .single();

    const callData = {
      vapi_call_id: call.id,
      company_id: companyId,
      vapi_assistant_id: assistantId,
      caller_number: customerNumber || 'Unknown',
      recipient_number: phoneNumber || 'Unknown',
      duration: Math.round(call.duration || 0),
      transcript: transcript || null,
      summary: summary || null,
      recording_url: recording?.url || null,
      resolution_status: mapVapiEndReasonToResolution(call.endedReason),
      ended_reason: call.endedReason || null,
      call_type: 'inbound',
      sentiment: analyzeSentiment(transcript, summary),
      priority: 'medium',
      cost_breakdown: call.cost || null,
      updated_at: new Date().toISOString(),
    };

    if (existingCall) {
      // Update existing call
      await supabase
        .from('calls')
        .update(callData)
        .eq('vapi_call_id', call.id);
    } else {
      // Create new call record
      await supabase.from('calls').insert(callData);
    }

    // --- BILLING LOGIC ---
    if (companyId && call.duration > 0) {
      const durationMinutes = Math.ceil(call.duration / 60);
      const ratePerMinuteCents = 25; // $0.25
      const totalCostCents = durationMinutes * ratePerMinuteCents;

      // 1. Deduct from wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('company_id', companyId)
        .single();

      if (wallet) {
        await supabase.rpc('increment_wallet_balance', {
          wallet_id: wallet.id,
          amount: -totalCostCents
        });

        // 2. Record Transaction
        await supabase.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          amount: -totalCostCents,
          type: 'usage',
          reference_id: call.id, // Vapi Call ID
          description: `Voice Call Usage (${durationMinutes} min)`,
        });

        // 3. Log Usage
        await supabase.from('usage_logs').insert({
          company_id: companyId,
          resource_type: 'voice_inbound', // TODO: Detect direction
          quantity: durationMinutes,
          cost: totalCostCents,
          meta: {
            vapi_call_id: call.id,
            duration_seconds: call.duration
          }
        });
      } else {
        console.warn(`[Billing] No wallet found for company ${companyId}`);
      }
    }

    return createSuccessResponse({ received: true });
  } catch (error) {
    console.error('[Vapi Webhook] Error handling end-of-call report:', error);
    return createSuccessResponse({ received: true }); // Don't fail webhook
  }
}

/**
 * Handle transcript event
 * Called when a transcript segment is available
 */
async function handleTranscript(message: any) {
  // Only store 'final' transcripts to reduce DB noise
  if (message.transcriptType !== 'final') {
    return createSuccessResponse({ received: true });
  }

  try {
    const supabase = createServiceRoleClient();
    
    // 1. Find our internal call_id using vapi_call_id
    const { data: call } = await supabase
      .from('calls')
      .select('id')
      .eq('vapi_call_id', message.call.id)
      .single();

    if (!call) {
      // Call record might not exist yet if webhook is faster than status-update
      console.warn('[Vapi Webhook] Call not found for transcript:', message.call.id);
      return createSuccessResponse({ received: true });
    }

    // 2. Insert segment
    await supabase.from('call_transcript_segments').insert({
      call_id: call.id,
      role: message.role,
      content: message.transcript,
      is_final: true
    });

    return createSuccessResponse({ received: true });
  } catch (error) {
    console.error('[Vapi Webhook] Error handling transcript:', error);
    return createSuccessResponse({ received: true });
  }
}

/**
 * Handle function-call event
 * Called when assistant invokes a custom function
 */
async function handleFunctionCall(message: any) {
  try {
    const { call, functionCall } = message;

    console.log('[Vapi Webhook] Function call:', {
      callId: call?.id,
      function: functionCall?.name,
      params: functionCall?.parameters,
    });

    // TODO: Implement custom function handlers
    // Example: Transfer call, create ticket, schedule callback, etc.

    return createSuccessResponse({
      result: {
        status: 'success',
        message: 'Function executed successfully',
      },
    });
  } catch (error) {
    console.error('[Vapi Webhook] Error handling function call:', error);
    return createErrorResponse('Function execution failed', 500);
  }
}

/**
 * Map Vapi call status to CoreComm resolution status
 */
function mapVapiStatusToResolution(
  status: string
): 'pending' | 'resolved' | 'escalated' | 'failed' {
  switch (status) {
    case 'ended':
      return 'resolved';
    case 'failed':
      return 'failed';
    case 'in-progress':
    case 'ringing':
      return 'pending';
    default:
      return 'pending';
  }
}

/**
 * Map Vapi end reason to resolution status
 */
function mapVapiEndReasonToResolution(
  endReason: string
): 'pending' | 'resolved' | 'escalated' | 'failed' {
  if (!endReason) return 'pending';

  // Common end reasons from Vapi
  if (endReason.includes('complete') || endReason.includes('success')) {
    return 'resolved';
  }
  if (endReason.includes('transfer') || endReason.includes('escalate')) {
    return 'escalated';
  }
  if (endReason.includes('error') || endReason.includes('failed')) {
    return 'failed';
  }

  return 'resolved'; // Default to resolved for normal completions
}

/**
 * Simple sentiment analysis based on transcript and summary
 */
function analyzeSentiment(
  transcript?: string,
  summary?: string
): 'positive' | 'neutral' | 'negative' {
  const text = `${transcript || ''} ${summary || ''}`.toLowerCase();

  // Simple keyword-based sentiment analysis
  const positiveWords = [
    'thank',
    'great',
    'excellent',
    'good',
    'happy',
    'satisfied',
    'appreciate',
    'wonderful',
  ];
  const negativeWords = [
    'angry',
    'frustrated',
    'terrible',
    'bad',
    'disappointed',
    'unhappy',
    'complaint',
    'issue',
  ];

  const positiveCount = positiveWords.filter((word) => text.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => text.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}
