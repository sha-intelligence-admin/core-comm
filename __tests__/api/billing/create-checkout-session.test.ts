
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/billing/create-checkout-session/route';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPaymentLink, createPlan, createSubscription } from '@/lib/flutterwave';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/flutterwave', () => ({
  createPaymentLink: jest.fn(),
  createPlan: jest.fn(),
  createSubscription: jest.fn(),
}));

describe('Create Checkout Session', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      upsert: jest.fn().mockReturnThis(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it('should create a payment link for top-up', async () => {
    // Mock user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
    });

    // Mock membership check
    mockSupabase.single.mockResolvedValue({
      data: { role: 'owner' },
    });

    // Mock Flutterwave response
    (createPaymentLink as jest.Mock).mockResolvedValue({
      data: { link: 'https://flutterwave.com/pay/link-123' },
    });

    const req = new NextRequest('http://localhost/api/billing/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        companyId: 'company-123',
        amount: 1000, // 10.00
        mode: 'payment',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.url).toBe('https://flutterwave.com/pay/link-123');
    expect(createPaymentLink).toHaveBeenCalledWith(expect.objectContaining({
      amount: 10, // 1000 / 100
      currency: 'USD',
      meta: {
        companyId: 'company-123',
        userId: 'user-123',
        mode: 'payment',
      },
    }));
  });

  it('should create a subscription', async () => {
    // Mock user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
    });

    // Mock membership check
    mockSupabase.single.mockResolvedValue({
      data: { role: 'owner' },
    });

    // Mock Flutterwave responses
    (createPlan as jest.Mock).mockResolvedValue({ data: { id: 'plan-123' } });
    (createSubscription as jest.Mock).mockResolvedValue({ data: { id: 'sub-123', customer: 'cust-123' } });

    const req = new NextRequest('http://localhost/api/billing/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        companyId: 'company-123',
        priceId: 'starter',
        mode: 'subscription',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.subscriptionId).toBe('sub-123');
    
    // Verify DB upsert
    expect(mockSupabase.upsert).toHaveBeenCalledWith({
      company_id: 'company-123',
      stripe_subscription_id: 'sub-123',
      stripe_customer_id: 'cust-123',
      plan_id: 'starter',
      status: 'trialing',
    }, { onConflict: 'company_id' });
  });
});
