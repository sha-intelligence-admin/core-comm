import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/billing/portal
 * Generates a URL for the billing portal (or fallback app URL).
 * 
 * @param req - NextRequest object containing companyId and returnUrl
 * @returns JSON response with the portal URL
 */
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

    // Flutterwave does not provide a hosted billing portal equivalent to Stripe Billing Portal.
    // Return an app-local "portal" URL so the UI can still offer a working manage-billing action.
    const origin = req.headers.get('origin') || '';
    const fallbackUrl = `${origin}/dashboard/billing`;

    return NextResponse.json({
      url: returnUrl || fallbackUrl,
      mode: 'app',
    });
  } catch (error: any) {
    console.error('[Billing Portal Error]', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
