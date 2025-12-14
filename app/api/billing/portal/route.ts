import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { companyId, returnUrl } = body;

    if (!companyId) {
      return new NextResponse('Company ID is required', { status: 400 });
    }

    // Verify user belongs to company
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get Stripe Customer ID
    const { data: subscription } = await supabase
      .from('billing_subscriptions')
      .select('stripe_customer_id')
      .eq('company_id', companyId)
      .single();

    if (!subscription?.stripe_customer_id) {
      return new NextResponse('No billing account found', { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl || `${req.headers.get('origin')}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe Portal Error]', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
