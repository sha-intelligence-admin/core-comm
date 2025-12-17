import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPlan, createSubscription } from '@/lib/flutterwave';

// Minimal mapping from app plan_id to amount and interval (in main currency units)
const APP_PLANS: Record<string, { amount: number; interval: 'monthly' | 'yearly' }> = {
  starter: { amount: 10.0, interval: 'monthly' },
  growth: { amount: 49.0, interval: 'monthly' },
  scale: { amount: 199.0, interval: 'monthly' },
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { companyId, planId } = body;
    if (!companyId || !planId) return new NextResponse('companyId and planId required', { status: 400 });

    // permission check
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const plan = APP_PLANS[planId];
    if (!plan) return new NextResponse('Unknown planId', { status: 400 });

    // Create a Flutterwave plan. Name it unique per company+planId so duplicates are easier to detect.
    const planPayload = {
      name: `corecomm-${companyId}-${planId}`,
      amount: plan.amount,
      interval: plan.interval === 'monthly' ? 'monthly' : 'yearly',
      currency: 'USD',
      description: `CoreComm ${planId} plan for company ${companyId}`,
    };

    const planResp = await createPlan(planPayload);
    const fwPlanId = planResp?.data?.id || planResp?.data?.plan_id || planResp?.id || null;
    if (!fwPlanId) {
      return new NextResponse('Failed to create plan in Flutterwave', { status: 500 });
    }

    // Create a subscription for this plan. Flutterwave expects a customer; we will use email to create one implicitly.
    const subPayload = {
      plan: fwPlanId,
      customer: {
        email: user.email,
      },
      // metadata helps when webhooks arrive
      metadata: {
        companyId,
        planId,
        userId: user.id,
      },
    };

    const subResp = await createSubscription(subPayload);
    const fwSubscriptionId = subResp?.data?.id || subResp?.data?.subscription_id || subResp?.id || null;
    const fwCustomerId = subResp?.data?.customer || subResp?.data?.customer_id || null;

    if (!fwSubscriptionId) {
      return new NextResponse('Failed to create subscription in Flutterwave', { status: 500 });
    }

    // Upsert into billing_subscriptions table mapping our app plan -> flutterwave ids
    await supabase.from('billing_subscriptions').upsert({
      company_id: companyId,
      stripe_subscription_id: fwSubscriptionId,
      stripe_customer_id: fwCustomerId || user.email,
      plan_id: planId,
      status: 'trialing',
    }, { onConflict: 'company_id' });

    // Return subscription info to caller
    return NextResponse.json({ subscriptionId: fwSubscriptionId, planId, plan: planPayload });
  } catch (err: any) {
    console.error('[Subscribe Error]', err);
    return new NextResponse(err?.message || 'Internal error', { status: 500 });
  }
}
