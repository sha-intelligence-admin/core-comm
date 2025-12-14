import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session, supabase);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice, supabase);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription, supabase);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, supabase);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  const companyId = session.client_reference_id;
  if (!companyId) {
    console.error('No client_reference_id (company_id) in session');
    return;
  }

  if (session.mode === 'subscription') {
    // Handle new subscription
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    
    // Retrieve subscription details to get the plan/product info if needed
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0].price.id;
    
    // Map priceId to plan_id (You might want a helper for this)
    // For now, we'll store the priceId or a derived plan name
    const planId = 'starter'; // TODO: Map from priceId

    await supabase.from('billing_subscriptions').upsert({
      company_id: companyId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      plan_id: planId,
      status: 'active',
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    });

    // Grant initial credits if applicable (e.g. 120 mins for Starter)
    // This logic might also live in invoice.payment_succeeded for recurring grants
  } else if (session.mode === 'payment') {
    // Handle one-time top-up
    const amountTotal = session.amount_total || 0; // in cents
    
    if (amountTotal > 0) {
      // 1. Get or Create Wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('company_id', companyId)
        .single();

      let walletId = wallet?.id;

      if (!wallet) {
        const { data: newWallet } = await supabase
          .from('wallets')
          .insert({ company_id: companyId, balance: 0 })
          .select()
          .single();
        walletId = newWallet.id;
      }

      // 2. Add funds
      await supabase.rpc('increment_wallet_balance', {
        wallet_id: walletId,
        amount: amountTotal
      });

      // 3. Record Transaction
      await supabase.from('wallet_transactions').insert({
        wallet_id: walletId,
        amount: amountTotal,
        type: 'top_up',
        reference_id: session.payment_intent as string,
        description: 'Credit Top-up',
      });
    }
  }
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: any
) {
  // Handle recurring subscription payments
  // This is where you'd grant monthly credits
  const subscriptionId = (invoice as any).subscription as string;
  
  // Find company by subscription_id
  const { data: sub } = await supabase
    .from('billing_subscriptions')
    .select('company_id, plan_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub) {
    // Grant monthly credits based on plan
    // e.g., Starter = $12.00 worth of credits (120 mins * $0.10)
    // This logic needs to be defined based on your pricing strategy
    
    // Example:
    // const creditAmount = getCreditsForPlan(sub.plan_id);
    // await addCreditsToWallet(sub.company_id, creditAmount, 'monthly_grant');
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: any
) {
  await supabase
    .from('billing_subscriptions')
    .update({
      status: subscription.status,
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  await supabase
    .from('billing_subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('stripe_subscription_id', subscription.id);
}
