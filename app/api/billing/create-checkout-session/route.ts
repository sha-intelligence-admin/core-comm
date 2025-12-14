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

    let sessionConfig: any = {
      mode: mode,
      client_reference_id: companyId,
      payment_method_types: ['card'],
      success_url: successUrl || `${req.headers.get('origin')}/dashboard/billing?success=true`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/dashboard/billing?canceled=true`,
      metadata: {
        companyId: companyId,
        userId: user.id,
      },
    };

    if (mode === 'subscription') {
      if (!priceId) {
        return new NextResponse('Price ID is required for subscriptions', { status: 400 });
      }
      sessionConfig.line_items = [
        {
          price: priceId,
          quantity: quantity,
        },
      ];
      // Allow promotion codes for subscriptions
      sessionConfig.allow_promotion_codes = true;
    } else if (mode === 'payment') {
      // Top-up logic
      if (!amount) {
        return new NextResponse('Amount is required for payments', { status: 400 });
      }
      
      // Use price_data for dynamic amount top-ups
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'CoreComm Credits',
              description: 'Prepaid credits for voice usage',
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ];
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
      // If no customer ID, Stripe will create one. 
      // We pre-fill email for better UX
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

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe Checkout Error]', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
