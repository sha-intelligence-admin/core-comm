
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/webhooks/flutterwave/route';
import { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/flutterwave';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn(),
}));

jest.mock('@/lib/flutterwave', () => ({
  verifyWebhookSignature: jest.fn(),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

describe('Flutterwave Webhook', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Supabase mock
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      rpc: jest.fn().mockReturnThis(),
    };

    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);
    (verifyWebhookSignature as jest.Mock).mockReturnValue(true);
    
    // Mock headers
    const { headers } = require('next/headers');
    headers.mockReturnValue({
      get: jest.fn().mockReturnValue('mock-signature'),
    });
  });

  it('should handle charge.completed for top-up', async () => {
    const payload = {
      event: 'charge.completed',
      data: {
        id: 12345,
        tx_ref: 'tx-ref-123',
        flw_ref: 'flw-ref-123',
        amount: 50,
        currency: 'USD',
        status: 'successful',
        meta: {
          companyId: 'company-123',
          mode: 'payment'
        },
        customer: {
          email: 'user@example.com'
        }
      }
    };

    const req = new NextRequest('http://localhost/api/webhooks/flutterwave', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Mock webhook_events check (not found)
    mockSupabase.single.mockResolvedValueOnce({ data: null }); 
    // Mock wallet lookup (wallet exists)
    mockSupabase.single.mockResolvedValueOnce({ data: { id: 'wallet-123', balance: 100 } }); 

    const res = await POST(req);

    expect(res.status).toBe(200);
    
    // Verify wallet update
    expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_wallet_balance', {
      wallet_id: 'wallet-123',
      amount: 5000, // 50 * 100 cents
    });

    // Verify transaction record
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      wallet_id: 'wallet-123',
      amount: 5000,
      type: 'top_up',
    }));
  });

  it('should handle charge.completed for subscription', async () => {
    const payload = {
      event: 'charge.completed',
      data: {
        id: 67890,
        tx_ref: 'tx-ref-sub',
        flw_ref: 'flw-ref-sub',
        amount: 49,
        currency: 'USD',
        status: 'successful',
        meta: {
          companyId: 'company-123',
          mode: 'subscription',
          planId: 'growth'
        },
        customer: {
          id: 'cust_123',
          email: 'user@example.com'
        },
        subscription: 'sub_123' // Flutterwave subscription ID
      }
    };

    const req = new NextRequest('http://localhost/api/webhooks/flutterwave', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Mock webhook_events check (not found)
    mockSupabase.single.mockResolvedValueOnce({ data: null });

    const res = await POST(req);

    expect(res.status).toBe(200);

    // Verify subscription upsert
    expect(mockSupabase.upsert).toHaveBeenCalledWith({
      company_id: 'company-123',
      stripe_subscription_id: 'sub_123', // Mapped to stripe_subscription_id column
      stripe_customer_id: 'cust_123',
      plan_id: 'growth',
      status: 'active',
      current_period_end: null,
    });
  });
});
