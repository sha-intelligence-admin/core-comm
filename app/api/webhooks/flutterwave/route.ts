import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/flutterwave';

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = headers().get('verif-hash') || headers().get('x-flutterwave-signature') || null;

  const supabase = createServiceRoleClient();

  // Verify signature when possible
  const verified = verifyWebhookSignature(raw, sig)
  if (!verified && process.env.FLUTTERWAVE_SECRET_KEY) {
    console.error('Flutterwave webhook signature verification failed')
    return new NextResponse('Invalid signature', { status: 400 })
  }

  let payload: any
  try {
    payload = JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse webhook payload', e)
    return new NextResponse('Invalid payload', { status: 400 })
  }

  const eventType = payload.event || payload.event_type || payload.type || ''
  const data = payload.data || payload;

  // Determine a stable event id (when provided by FW). If not available we skip dedupe.
  const eventId = payload.id || payload.event_id || (data && (data.id || data.flw_ref)) || null;

  // Idempotency: if we've already processed this exact event, return 200
  if (eventId) {
    try {
      const { data: existing } = await supabase.from('webhook_events').select('processed').eq('event_id', eventId).single();
      if (existing) {
        console.log('Duplicate webhook event received, skipping', { eventId, eventType })
        return new NextResponse(null, { status: 200 })
      }

      // Insert a record to mark processing started (processed=false)
      await supabase.from('webhook_events').insert({ event_id: eventId, event_type: eventType, raw: payload });
    } catch (e) {
      console.warn('Failed to record webhook event for idempotency, continuing', e);
    }
  }

  try {
    switch (eventType) {
      case 'charge.completed':
      case 'charge.success': {
        await handleChargeCompleted(data, supabase)
        break
      }
      case 'subscription.charge.success':
      case 'subscription.charge.completed': {
        await handleSubscriptionChargeSuccess(data, supabase)
        break
      }
      case 'subscription.charge.failed':
      case 'subscription.charge.failed_event': {
        await handleSubscriptionChargeFailed(data, supabase)
        break
      }
      case 'subscription.updated': {
        await handleSubscriptionUpdatedFW(data, supabase)
        break
      }
      case 'subscription.deleted':
      case 'subscription.cancelled': {
        await handleSubscriptionDeletedFW(data, supabase)
        break
      }
      default:
        console.log(`Unhandled Flutterwave event type ${eventType}`)
    }
  } catch (error: any) {
    console.error(`Error processing webhook: ${error?.message || error}`)

    // If we have an eventId, update the record with the error so we can inspect later
    if (eventId) {
      try {
        await supabase.from('webhook_events').update({ error: (error?.message || String(error)) }).eq('event_id', eventId);
      } catch (e) {
        console.warn('Failed to update webhook_events with error', e);
      }
    }

    return new NextResponse(`Webhook Error`, { status: 500 })
  }

  // Mark event processed if we recorded it earlier
  if (eventId) {
    try {
      await supabase.from('webhook_events').update({ processed: true, processed_at: new Date().toISOString() }).eq('event_id', eventId);
    } catch (e) {
      console.warn('Failed to mark webhook event processed', e);
    }
  }

  return new NextResponse(null, { status: 200 })
}

async function handleSubscriptionChargeSuccess(data: any, supabase: any) {
  const subscriptionId = data.subscription || data.subscription_id || data.id || data.flw_ref
  if (!subscriptionId) return

  // amount paid
  const amountFloat = Number(data.amount || data.amount_paid || data.amount_settled || 0)
  const amountCents = Math.round(amountFloat * 100)

  // lookup subscription record
  const { data: sub } = await supabase
    .from('billing_subscriptions')
    .select('company_id, plan_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!sub) {
    console.warn('Subscription charge success received but no local subscription found', { subscriptionId })
    return
  }

  // Update subscription status and period end if provided
  await supabase
    .from('billing_subscriptions')
    .update({ status: 'active', current_period_end: data.current_period_end || data.next_billing_date || null })
    .eq('stripe_subscription_id', subscriptionId)

  // Grant monthly credits equal to amount paid (in cents)
  if (amountCents > 0) {
    await grantMonthlyCredits(sub.company_id, amountCents, supabase, subscriptionId)
  }
}

async function handleSubscriptionChargeFailed(data: any, supabase: any) {
  const subscriptionId = data.subscription || data.subscription_id || data.id || data.flw_ref
  if (!subscriptionId) return

  await supabase
    .from('billing_subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId)
  // Record a notification so downstream systems (email, UI) can alert the customer
  try {
    // Look up company_id
    const { data: sub } = await supabase.from('billing_subscriptions').select('company_id').eq('stripe_subscription_id', subscriptionId).single();
    const companyId = sub?.company_id || null;
    await supabase.from('billing_notifications').insert({
      company_id: companyId,
      type: 'subscription_payment_failed',
      meta: JSON.stringify({ subscriptionId, payload: data }),
    });
  } catch (e) {
    console.warn('Failed to insert billing notification for failed charge', e);
  }
}

async function grantMonthlyCredits(companyId: string, amountCents: number, supabase: any, referenceId?: string) {
  // 1. Get or Create Wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('company_id', companyId)
    .single()

  let walletId = wallet?.id

  if (!wallet) {
    const { data: newWallet } = await supabase
      .from('wallets')
      .insert({ company_id: companyId, balance: 0 })
      .select()
      .single()
    walletId = newWallet.id
  }

  // 2. Add funds (amountCents is in cents)
  await supabase.rpc('increment_wallet_balance', {
    wallet_id: walletId,
    amount: amountCents,
  })

  // 3. Record Transaction
  await supabase.from('wallet_transactions').insert({
    wallet_id: walletId,
    amount: amountCents,
    type: 'monthly_grant',
    reference_id: referenceId,
    description: 'Monthly subscription grant (Flutterwave)',
  })
}

async function handleChargeCompleted(data: any, supabase: any) {
  // Extract company id from metadata
  const meta = data.meta || data.metadata || {};
  const companyId = meta.companyId || meta.company_id || meta.client_reference_id || null;

  if (!companyId) {
    console.warn('Charge completed webhook missing company id in metadata', { data })
    return
  }

  const mode = meta.mode || 'payment'

  if (mode === 'subscription') {
    const subscriptionId = data.subscription || data.id || data.flw_ref
    const customerId = data.customer?.id || data.customer?.customer_id || data.customer_id || null
    const planId = meta.planId || meta.priceId || 'starter'

    await supabase.from('billing_subscriptions').upsert({
      company_id: companyId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      plan_id: planId,
      status: 'active',
      current_period_end: null,
    })
  } else {
    // Treat as one-time top-up
    const amountFloat = Number(data.amount || data.amount_paid || data.amount_settled || 0)
    const amountCents = Math.round(amountFloat * 100)
    if (amountCents <= 0) return

    // 1. Get or Create Wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('company_id', companyId)
      .single()

    let walletId = wallet?.id

    if (!wallet) {
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert({ company_id: companyId, balance: 0 })
        .select()
        .single()
      walletId = newWallet.id
    }

    // 2. Add funds
    await supabase.rpc('increment_wallet_balance', {
      wallet_id: walletId,
      amount: amountCents,
    })

    // 3. Record Transaction
    await supabase.from('wallet_transactions').insert({
      wallet_id: walletId,
      amount: amountCents,
      type: 'top_up',
      reference_id: data.tx_ref || data.payment_id || data.id,
      description: 'Credit Top-up (Flutterwave)',
    })
  }
}

async function handleSubscriptionUpdatedFW(data: any, supabase: any) {
  const subscriptionId = data.id || data.subscription_id || data.flw_ref
  if (!subscriptionId) return
  await supabase
    .from('billing_subscriptions')
    .update({
      status: data.status || 'active',
      current_period_end: data.current_period_end ? new Date(data.current_period_end).toISOString() : null,
    })
    .eq('stripe_subscription_id', subscriptionId)
}

async function handleSubscriptionDeletedFW(data: any, supabase: any) {
  const subscriptionId = data.id || data.subscription_id || data.flw_ref
  if (!subscriptionId) return
  await supabase
    .from('billing_subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscriptionId)
}
