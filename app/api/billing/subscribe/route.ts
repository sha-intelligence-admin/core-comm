import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPaymentLink } from '@/lib/flutterwave';
import { PRICING_TIERS, PlanId } from '@/app/constants/pricing';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { companyId, planId } = body;
    if (!companyId || !planId) return new NextResponse('companyId and planId required', { status: 400 });

    // permission check
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!userData || userData.company_id !== companyId) {
      return new NextResponse('Forbidden: User does not belong to this company', { status: 403 });
    }

    const plan = PRICING_TIERS[planId as PlanId];
    if (!plan || plan.price === null) return new NextResponse('Unknown or custom planId', { status: 400 });

    // Use the pre-created Flutterwave Plan ID
    const fwPlanId = plan.flutterwave_plan_id;
    if (!fwPlanId) {
      return new NextResponse('Plan configuration error: Missing Flutterwave Plan ID', { status: 500 });
    }

    // Create a payment link for this plan
    const origin = req.headers.get('origin') || '';
    const success_url = `${origin}/dashboard/billing?success=true`;

    const payload = {
      tx_ref: `sub-${companyId}-${Date.now()}`,
      amount: plan.price,
      currency: 'USD',
      payment_plan: fwPlanId,
      redirect_url: success_url,
      customer: {
        email: user.email,
      },
      meta: {
        companyId,
        planId,
        userId: user.id,
        mode: 'subscription'
      },
    };

    const resp = await createPaymentLink(payload);
    
    if (resp.status !== 'success' || !resp.data?.link) {
      console.error('Flutterwave Error:', resp);
      return new NextResponse('Failed to create payment link', { status: 500 });
    }

    // Return the link to the frontend
    return NextResponse.json({ link: resp.data.link });

  } catch (err: any) {
    console.error('[Subscribe Error]', err);
    return new NextResponse(err?.message || 'Internal error', { status: 500 });
  }
}
