import { NextRequest, NextResponse } from 'next/server';
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

    // Flutterwave does not provide a hosted customer billing portal equivalent to Stripe Billing Portal.
    // For now, return a helpful message so UI can direct users to the app billing page or use payment links.
    return NextResponse.json({
      error: 'Not implemented: Flutterwave does not provide a hosted billing portal. Use app billing UI or create payment links.',
    }, { status: 501 });
  } catch (error: any) {
    console.error('[Billing Portal Error]', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
