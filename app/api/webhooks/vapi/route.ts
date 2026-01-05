import { NextRequest } from 'next/server';
import { verifyVapiWebhookSignature } from '@/lib/vapi/webhook';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';
import type { WebhookPayload } from '@/lib/vapi/types';
import { PRICING_TIERS, OVERAGE_RATES, PlanId } from '@/app/constants/pricing';
import { IntegrationFactory } from '@/lib/integrations/factory';

/**
 * POST /api/webhooks/vapi
 * Handles Vapi webhook events for call lifecycle management.
 * 
 * Events:
 * - assistant-request: Vapi requesting assistant config for incoming call
 * - status-update: Call status changes
 * - end-of-call-report: Call completed with full details
 * - function-call: Custom function invocation
 * - transcript: Real-time transcript updates
 * 
 * @param request - NextRequest object containing webhook payload
 * @returns JSON response with processing status or assistant config
 */
export async function POST(request: NextRequest) {
  try {
    // Read raw body once (needed for signature verification)
    // In Jest/unit tests, request may be mocked without `text()`.
    let rawBody: string;
    if (typeof (request as any).text === 'function') {
      rawBody = await (request as any).text();
    } else {
      const bodyObj = typeof (request as any).json === 'function' ? await (request as any).json() : {};
      rawBody = JSON.stringify(bodyObj);
    }

    // Verify webhook signature (recommended in production)
    const signature = request.headers.get('x-vapi-signature');
    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!signature) {
        return createErrorResponse('Missing webhook signature', 401);
      }

      const isValid = verifyVapiWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return createErrorResponse('Invalid webhook signature', 401);
      }
    }

    // Parse webhook payload
    const payload: WebhookPayload = JSON.parse(rawBody);
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

    // --- BILLING ENFORCEMENT ---
    const companyId = phoneNumbers.company_id;
    
    // 1. Check Wallet Balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('company_id', companyId)
      .single();

    // 2. Check Subscription Status
    const { data: subscription } = await supabase
      .from('billing_subscriptions')
      .select('status, plan_id')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .single();

    // Logic:
    // - If Enterprise plan: Allow (assuming post-paid or high limits)
    // - If Active Subscription:
    //   - Check if within monthly limits (optional, but good)
    //   - OR Check if wallet has funds for overage
    // - If No Subscription / Inactive:
    //   - Check if wallet has funds (Pay-as-you-go)
    
    const isEnterprise = subscription?.plan_id === 'enterprise';
    const hasActiveSubscription = subscription?.status === 'active';
    const hasFunds = (wallet?.balance || 0) > 0; // Balance is in cents

    // Strict check: Must have funds OR be Enterprise
    // You might want to allow if they have an active subscription even with 0 balance 
    // IF they haven't used up their included minutes. 
    // For simplicity/safety, we require positive balance or Enterprise.
    
    if (!isEnterprise && !hasFunds) {
      console.warn(`[Billing] Call rejected for company ${companyId}: Insufficient funds (Balance: ${wallet?.balance})`);
      
      // Return a specific "Payment Required" message
      return createSuccessResponse({
        assistant: {
          firstMessage: "I'm sorry, but this account has insufficient funds to complete this call. Please contact the administrator.",
          voice: {
            provider: '11labs',
            voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
          },
          // End call immediately after message
          endCallAfterSpoken: true,
        },
      });
    }
    // ---------------------------

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
      let overageMinutes = durationMinutes;
      let costCents = 0;
      let planName = 'unknown';

      // 1. Check Subscription & Allowance
      const { data: subscription } = await supabase
        .from('billing_subscriptions')
        .select('id, plan_id')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .single();

      if (subscription) {
        const plan = PRICING_TIERS[subscription.plan_id as PlanId];
        if (plan) {
          planName = plan.name;
          
          // Get current usage period
          const now = new Date().toISOString();
          const { data: usagePeriod } = await supabase
            .from('billing_usage_periods')
            .select('id, voice_minutes_used')
            .eq('subscription_id', subscription.id)
            .lte('period_start', now)
            .gte('period_end', now)
            .single();

          if (usagePeriod && plan.limits.voice_minutes !== null) {
             const used = Number(usagePeriod.voice_minutes_used);
             const limit = plan.limits.voice_minutes;
             const remaining = Math.max(0, limit - used);
             
             const covered = Math.min(remaining, durationMinutes);
             overageMinutes = Math.max(0, durationMinutes - covered);
             
             // Update usage period
             await supabase
               .from('billing_usage_periods')
               .update({ 
                 voice_minutes_used: used + durationMinutes 
               })
               .eq('id', usagePeriod.id);
          }
        }
      }

      // 2. Calculate Cost for Overage
      if (overageMinutes > 0) {
        const ratePerMinuteCents = OVERAGE_RATES.voice_minute * 100;
        costCents = Math.round(overageMinutes * ratePerMinuteCents);

        // Deduct from wallet
        const { data: wallet } = await supabase
          .from('wallets')
          .select('id')
          .eq('company_id', companyId)
          .single();

        if (wallet) {
          await supabase.rpc('increment_wallet_balance', {
            wallet_id: wallet.id,
            amount: -costCents
          });

          // Record Transaction
          await supabase.from('wallet_transactions').insert({
            wallet_id: wallet.id,
            amount: -costCents,
            type: 'usage',
            reference_id: call.id,
            description: `Voice Call Overage (${overageMinutes} min) - Plan: ${planName}`,
          });
        } else {
          console.warn(`[Billing] No wallet found for company ${companyId}`);
        }
      }

      // 3. Log Usage
      await supabase.from('usage_logs').insert({
        company_id: companyId,
        resource_type: 'voice_inbound', // TODO: Detect direction
        quantity: durationMinutes,
        cost: costCents,
        meta: {
          vapi_call_id: call.id,
          duration_seconds: call.duration,
          overage_minutes: overageMinutes,
          plan_id: subscription?.plan_id
        }
      });
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
    const assistantId = call?.assistantId;

    console.log('[Vapi Webhook] Function call:', {
      callId: call?.id,
      assistantId,
      function: functionCall?.name,
      params: functionCall?.parameters,
    });

    if (!assistantId) {
      throw new Error('Missing assistant ID');
    }

    // 1. Get company ID from assistant
    const supabase = createServiceRoleClient();
    const { data: assistant, error: assistantError } = await supabase
      .from('vapi_assistants')
      .select('company_id')
      .eq('vapi_assistant_id', assistantId)
      .single();

    if (assistantError || !assistant) {
      console.error('[Vapi Webhook] Assistant not found:', assistantId);
      return createSuccessResponse({
        result: {
          status: 'error',
          message: 'Assistant not found',
        },
      });
    }

    // 2. Get active integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from('integrations')
      .select('*')
      .eq('company_id', assistant.company_id)
      .eq('is_active', true);

    if (integrationsError || !integrations || integrations.length === 0) {
      console.warn('[Vapi Webhook] No active integrations found for company:', assistant.company_id);
      return createSuccessResponse({
        result: {
          status: 'error',
          message: 'No active integrations configured',
        },
      });
    }

    // 3. Execute function on integrations
    const results = [];
    for (const integration of integrations) {
      try {
        const provider = IntegrationFactory.getProvider(integration.type);
        if (provider.executeAction) {
          const result = await provider.executeAction(
            integration.config,
            functionCall.name,
            functionCall.parameters
          );
          results.push({ integration: integration.type, result });

          // Best-effort audit log for action execution (used for dashboard metrics)
          try {
            const supabaseForAudit = createServiceRoleClient();
            await supabaseForAudit.from('audit_logs').insert({
              company_id: assistant.company_id,
              user_id: null,
              actor_name: 'Vapi',
              action: integration.type === 'mcp' ? 'mcp_action' : 'integration_action',
              resource: 'integrations',
              details: {
                integration_id: integration.id,
                integration_type: integration.type,
                function: functionCall.name,
                call_id: call?.id,
                success: true,
              },
            });
          } catch (auditError) {
            console.warn('[Vapi Webhook] Failed to write audit log (success):', auditError);
          }
        }
      } catch (error: any) {
        console.error(`[Vapi Webhook] Integration ${integration.type} failed:`, error);
        results.push({ integration: integration.type, error: error.message });

        // Best-effort audit log for failures too
        try {
          const supabaseForAudit = createServiceRoleClient();
          await supabaseForAudit.from('audit_logs').insert({
            company_id: assistant.company_id,
            user_id: null,
            actor_name: 'Vapi',
            action: integration.type === 'mcp' ? 'mcp_action' : 'integration_action',
            resource: 'integrations',
            details: {
              integration_id: integration.id,
              integration_type: integration.type,
              function: functionCall.name,
              call_id: call?.id,
              success: false,
              error: error.message,
            },
          });
        } catch (auditError) {
          console.warn('[Vapi Webhook] Failed to write audit log (failure):', auditError);
        }
      }
    }

    // Return the first successful result or a summary
    const successResult = results.find(r => !r.error);
    
    return createSuccessResponse({
      result: successResult ? successResult.result : {
        status: 'completed',
        results
      },
    });

  } catch (error: any) {
    console.error('[Vapi Webhook] Error handling function call:', error);
    return createSuccessResponse({
      result: {
        status: 'error',
        message: error.message || 'Internal server error',
      },
    });
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
