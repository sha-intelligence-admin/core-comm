import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelSubscription } from '@/lib/flutterwave';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const subscriptionId = params.id;
    if (!subscriptionId) return new NextResponse('subscription id required', { status: 400 });

    // Verify this company owns the subscription
    const { data: record } = await supabase
      .from('billing_subscriptions')
      .select('company_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (!record) return new NextResponse('Subscription not found', { status: 404 });

    // permission check: ensure caller is owner/admin of the company
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', record.company_id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Cancel at Flutterwave
    const resp = await cancelSubscription(subscriptionId);

    // Update local record status
    await supabase.from('billing_subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', subscriptionId);

    return NextResponse.json({ canceled: true, providerResponse: resp });
  } catch (err: any) {
    console.error('[Cancel Subscription Error]', err);
    return new NextResponse(err?.message || 'Internal error', { status: 500 });
  }
}
