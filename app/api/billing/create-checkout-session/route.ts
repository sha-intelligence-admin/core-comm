import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPaymentLink, createPlan, createSubscription } from '@/lib/flutterwave';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { priceId, quantity = 1, mode, amount, companyId, successUrl, cancelUrl } = body;

    if (!companyId) {
      return new NextResponse('Company ID is required', { status: 400 });
    }

    // Verify user belongs to company and has permission
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return new NextResponse('Forbidden: Only Owners and Admins can manage billing', { status: 403 });
    }

    // Build Flutterwave payment link payload
    const origin = req.headers.get('origin') || '';
    const success_url = successUrl || `${origin}/dashboard/billing?success=true`;
    const cancel_url = cancelUrl || `${origin}/dashboard/billing?canceled=true`;

    let sessionConfig: any = {
      tx_ref: `${companyId}-${Date.now()}`,
      redirect_url: success_url,
      currency: 'USD',
      meta: {
        companyId: companyId,
        userId: user.id,
        mode,
      },
      customer: {
        email: user.email,
      },
    };

    if (mode === 'subscription') {
      if (!priceId) {
        return new NextResponse('Price ID is required for subscriptions', { status: 400 });
      }

      // Create a plan and subscription immediately and return the subscription id.
      // Note: This creates a Flutterwave plan named per company+priceId and a subscription for the current user.
      const APP_PLANS: Record<string, { amount: number; interval: 'monthly' | 'yearly' }> = {
        starter: { amount: 10.0, interval: 'monthly' },
        growth: { amount: 49.0, interval: 'monthly' },
        scale: { amount: 199.0, interval: 'monthly' },
      };

      const plan = APP_PLANS[priceId];
      if (!plan) return new NextResponse('Unknown priceId', { status: 400 });

      const planPayload = {
        name: `corecomm-${companyId}-${priceId}`,
        amount: plan.amount,
        interval: plan.interval === 'monthly' ? 'monthly' : 'yearly',
        currency: 'USD',
        description: `CoreComm ${priceId} plan for company ${companyId}`,
      };

      const planResp = await createPlan(planPayload);
      const fwPlanId = planResp?.data?.id || planResp?.data?.plan_id || planResp?.id || null;
      if (!fwPlanId) return new NextResponse('Failed to create plan', { status: 500 });

      const subPayload = {
        plan: fwPlanId,
        customer: { email: user.email },
        metadata: { companyId, planId: priceId, userId: user.id },
      };

      const subResp = await createSubscription(subPayload);
      const fwSubscriptionId = subResp?.data?.id || subResp?.data?.subscription_id || subResp?.id || null;
      if (!fwSubscriptionId) return new NextResponse('Failed to create subscription', { status: 500 });

      // persist mapping
      // Note: We are using the existing 'stripe_subscription_id' and 'stripe_customer_id' columns 
      // to store Flutterwave IDs to avoid database migration complexity.
      await supabase.from('billing_subscriptions').upsert({
        company_id: companyId,
        stripe_subscription_id: fwSubscriptionId,
        stripe_customer_id: subResp?.data?.customer || user.email,
        plan_id: priceId,
        status: 'trialing',
      }, { onConflict: 'company_id' });

      return NextResponse.json({ subscriptionId: fwSubscriptionId });
    } else if (mode === 'payment') {
      if (!amount) {
        return new NextResponse('Amount is required for payments', { status: 400 });
      }
      // Flutterwave expects amount in main currency units
      sessionConfig.amount = Number((amount / 100).toFixed(2));
      sessionConfig.description = 'CoreComm Credits';
      // Use cancel_url by redirecting back to cancel page if needed (Flutterwave supports redirect_url only)
    } else {
      return new NextResponse('Invalid mode. Must be "subscription" or "payment"', { status: 400 });
    }

    // Check if customer already exists for this company
    const { data: subscription } = await supabase
      .from('billing_subscriptions')
      .select('stripe_customer_id')
      .eq('company_id', companyId)
      .single();

    if (subscription?.stripe_customer_id) {
      sessionConfig.customer = subscription.stripe_customer_id;
    } else {
      // If no customer ID, we pre-fill email for better UX
      sessionConfig.customer_email = user.email;
      
      // We can also add subscription_data.metadata to help track the new customer creation if needed
      if (mode === 'subscription') {
        sessionConfig.subscription_data = {
          metadata: {
            companyId: companyId
          }
        };
      }
    }

    const resp = await createPaymentLink(sessionConfig);
    // flutterwave returns data.link
    const url = resp?.data?.link || resp?.data?.url || resp?.data?.payment_link || resp?.link || null;
    if (!url) {
      return new NextResponse('Failed to create Flutterwave payment link', { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('[Flutterwave Checkout Error]', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
