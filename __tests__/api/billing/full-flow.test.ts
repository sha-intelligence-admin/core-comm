/**
 * @jest-environment node
 */
import { POST as subscribePOST } from '@/app/api/billing/subscribe/route';
import { POST as webhookPOST } from '@/app/api/webhooks/flutterwave/route';
import { POST as vapiWebhookPOST } from '@/app/api/webhooks/vapi/route';
import { NextRequest } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { createPlan, createSubscription, createPaymentLink, verifyWebhookSignature } from '@/lib/flutterwave';
import { PRICING_TIERS } from '@/app/constants/pricing';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
  createServiceRoleClient: jest.fn(),
}));

jest.mock('@/lib/flutterwave', () => ({
  createPlan: jest.fn(),
  createSubscription: jest.fn(),
  createPaymentLink: jest.fn(),
  verifyWebhookSignature: jest.fn(),
}));

describe('Billing Full Flow', () => {
  let mockSupabase: any;
  let mockServiceSupabase: any;
  let db: any = {
    billing_subscriptions: [],
    billing_usage_periods: [],
    wallets: [],
    wallet_transactions: [],
    usage_logs: [],
    webhook_events: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    db = {
      billing_subscriptions: [],
      billing_usage_periods: [],
      wallets: [{ id: 'wallet-123', company_id: 'company-123', balance: 0 }],
      wallet_transactions: [],
      usage_logs: [],
      webhook_events: [],
    };

    // Helper to mock Supabase chain
    const createMockDb = () => ({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123', email: 'user@example.com' } } }),
      },
      from: jest.fn((table) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(async () => {
          if (table === 'users') return { data: { company_id: 'company-123' } };
          if (table === 'organization_memberships') return { data: { role: 'owner', company_id: 'company-123' } };
          if (table === 'wallets') return { data: db.wallets.find((w: any) => w.company_id === 'company-123') };
          if (table === 'billing_subscriptions') return { data: db.billing_subscriptions.find((s: any) => s.company_id === 'company-123') };
          if (table === 'billing_usage_periods') return { data: db.billing_usage_periods.find((p: any) => p.subscription_id === 'sub-123') };
          if (table === 'webhook_events') return { data: null }; // No duplicate event
          return { data: null };
        }),
        upsert: jest.fn().mockImplementation(async (data) => {
          if (table === 'billing_subscriptions') {
             const existingIndex = db.billing_subscriptions.findIndex((s: any) => s.company_id === data.company_id);
             if (existingIndex >= 0) db.billing_subscriptions[existingIndex] = { ...db.billing_subscriptions[existingIndex], ...data };
             else db.billing_subscriptions.push({ id: 'sub-123', ...data });
          }
          return { error: null };
        }),
        insert: jest.fn().mockImplementation(async (data) => {
          if (db[table]) db[table].push(data);
          return { error: null };
        }),
        update: jest.fn().mockImplementation(async (data) => {
           // Mock update logic for usage periods
           if (table === 'billing_usage_periods') {
             const period = db.billing_usage_periods[0];
             if (period) Object.assign(period, data);
           }
           return { error: null };
        }),
      })),
      rpc: jest.fn().mockImplementation(async (func, args) => {
        if (func === 'increment_wallet_balance') {
          const wallet = db.wallets.find((w: any) => w.id === args.wallet_id);
          if (wallet) wallet.balance += args.amount;
        }
        return { error: null };
      }),
    });

    mockSupabase = createMockDb();
    mockServiceSupabase = createMockDb();

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockServiceSupabase);
    (verifyWebhookSignature as jest.Mock).mockReturnValue(true);
  });

  it('1. Subscribe to Starter Plan', async () => {
    // Mock Flutterwave
    (createPaymentLink as jest.Mock).mockResolvedValue({ status: 'success', data: { link: 'https://checkout.flutterwave.com/pay/123' } });

    const req = new NextRequest('http://localhost/api/billing/subscribe', {
      method: 'POST',
      body: JSON.stringify({ companyId: 'company-123', planId: 'starter' }),
    });

    const res = await subscribePOST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.link).toBe('https://checkout.flutterwave.com/pay/123');

    // Verify DB state - Subscription should NOT be created yet (waits for webhook)
    expect(db.billing_subscriptions).toHaveLength(0);
  });

  it('2. Process Webhook (Charge Completed) -> Activate Subscription & Create Usage Period', async () => {
    // Setup: No subscription exists yet
    expect(db.billing_subscriptions).toHaveLength(0);

    const webhookPayload = {
      event: 'charge.completed',
      data: {
        status: 'successful',
        tx_ref: 'ref-123',
        id: 'sub-fw-123', // Subscription ID from FW
        customer: { email: 'user@example.com', id: 'cust-123' },
        meta: { companyId: 'company-123', planId: 'starter', mode: 'subscription' } // Metadata we sent
      }
    };

    const req = new NextRequest('http://localhost/api/webhooks/flutterwave', {
      method: 'POST',
      body: JSON.stringify(webhookPayload),
      headers: { 'verif-hash': 'valid-hash' }
    });

    // We need to mock the specific handler logic inside the webhook route
    // Since we can't easily mock the internal functions of the route file, 
    // we will rely on the route calling supabase.
    
    mockServiceSupabase.from = jest.fn((table) => {
        if (table === 'billing_subscriptions') {
            return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null }), // No existing sub
                update: jest.fn().mockReturnThis(),
                upsert: jest.fn().mockImplementation((data) => {
                    const existingIndex = db.billing_subscriptions.findIndex((s: any) => s.company_id === data.company_id);
                    if (existingIndex >= 0) db.billing_subscriptions[existingIndex] = { ...db.billing_subscriptions[existingIndex], ...data };
                    else db.billing_subscriptions.push({ id: 'sub-123', ...data });
                    return { error: null };
                }),
                insert: jest.fn(), 
            };
        }
        if (table === 'billing_usage_periods') {
            return {
                insert: jest.fn().mockImplementation((data) => {
                    db.billing_usage_periods.push(data);
                    return { error: null };
                }),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null }), // No existing period
            };
        }
        if (table === 'webhook_events') {
             return {
                 select: jest.fn().mockReturnThis(),
                 eq: jest.fn().mockReturnThis(),
                 single: jest.fn().mockResolvedValue({ data: null }),
                 insert: jest.fn(),
                 update: jest.fn().mockReturnThis(),
             }
        }
        return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn() };
    });

    const res = await webhookPOST(req);
    expect(res.status).toBe(200);

    // Verify Subscription Created
    expect(db.billing_subscriptions).toHaveLength(1);
    expect(db.billing_subscriptions[0]).toMatchObject({
        company_id: 'company-123',
        plan_id: 'starter',
        status: 'active',
        stripe_subscription_id: 'sub-fw-123'
    });
  });

  it('3. Track Usage (Voice Call) - Under Limit', async () => {
    // Setup: Active Starter Subscription (600 mins limit)
    db.billing_subscriptions.push({
      id: 'sub-123',
      company_id: 'company-123',
      plan_id: 'starter',
      status: 'active',
    });
    // Setup: Usage Period (0 used)
    db.billing_usage_periods.push({
      id: 'period-123',
      subscription_id: 'sub-123',
      voice_minutes_used: 0,
      period_start: new Date().toISOString(),
      period_end: new Date(Date.now() + 86400000).toISOString(),
    });

    // Mock Vapi Webhook Payload
    const payload = {
      message: {
        type: 'end-of-call-report',
        call: {
          id: 'call-vapi-1',
          duration: 300, // 5 minutes
          phoneNumber: { number: '+1234567890' },
          cost: 0.5,
        }
      }
    };

    // Mock finding phone number -> company
    mockServiceSupabase.from = jest.fn((table) => {
        const defaultMock = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null }),
            update: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            rpc: jest.fn().mockReturnThis(),
        };

        if (table === 'vapi_phone_numbers') {
            return {
                ...defaultMock,
                single: jest.fn().mockResolvedValue({ data: { company_id: 'company-123' } }),
            };
        }
        if (table === 'billing_subscriptions') {
             return {
                 ...defaultMock,
                 single: jest.fn().mockResolvedValue({ data: db.billing_subscriptions[0] }),
             };
        }
        if (table === 'billing_usage_periods') {
             return {
                 ...defaultMock,
                 single: jest.fn().mockResolvedValue({ data: db.billing_usage_periods[0] }),
                 update: jest.fn().mockImplementation((data) => {
                     Object.assign(db.billing_usage_periods[0], data);
                     return { eq: jest.fn() };
                 })
             };
        }
        if (table === 'calls') {
             return { ...defaultMock, single: jest.fn().mockResolvedValue({ data: null }) }; // New call
        }
        
        return defaultMock;
    });

    const req = new NextRequest('http://localhost/api/webhooks/vapi', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const res = await vapiWebhookPOST(req);
    expect(res.status).toBe(200); // Should return success

    // Verify Usage Updated
    expect(db.billing_usage_periods[0].voice_minutes_used).toBe(5); // 300s / 60 = 5 mins
    
    // Verify No Wallet Deduction (Under limit)
    expect(db.wallets[0].balance).toBe(0);
  });

  it('4. Track Usage (Voice Call) - Overage', async () => {
    // Setup: Active Starter Subscription (240 mins limit)
    db.billing_subscriptions.push({
      id: 'sub-123',
      company_id: 'company-123',
      plan_id: 'starter',
      status: 'active',
    });
    // Setup: Usage Period (238 used, limit 240)
    db.billing_usage_periods.push({
      id: 'period-123',
      subscription_id: 'sub-123',
      voice_minutes_used: 238,
      period_start: new Date().toISOString(),
      period_end: new Date(Date.now() + 86400000).toISOString(),
    });
    // Setup: Wallet with funds
    db.wallets[0].balance = 1000; // $10.00

    // Mock Vapi Webhook Payload (5 min call)
    // 2 mins included, 3 mins overage
    const payload = {
      message: {
        type: 'end-of-call-report',
        call: {
          id: 'call-vapi-2',
          duration: 300, // 5 minutes
          phoneNumber: { number: '+1234567890' },
        }
      }
    };

    // Mock DB calls (similar to previous test)
    mockServiceSupabase.from = jest.fn((table) => {
        const defaultMock = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null }),
            update: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            rpc: jest.fn().mockReturnThis(),
        };

        if (table === 'vapi_phone_numbers') return { ...defaultMock, single: jest.fn().mockResolvedValue({ data: { company_id: 'company-123' } }) };
        if (table === 'billing_subscriptions') return { ...defaultMock, single: jest.fn().mockResolvedValue({ data: db.billing_subscriptions[0] }) };
        if (table === 'billing_usage_periods') return { 
            ...defaultMock, 
            single: jest.fn().mockResolvedValue({ data: db.billing_usage_periods[0] }),
            update: jest.fn().mockImplementation((data) => {
                Object.assign(db.billing_usage_periods[0], data);
                return { eq: jest.fn() };
            })
        };
        if (table === 'wallets') return { ...defaultMock, single: jest.fn().mockResolvedValue({ data: db.wallets[0] }) };
        if (table === 'calls') return { ...defaultMock, single: jest.fn().mockResolvedValue({ data: null }) };

        return defaultMock;
    });
    
    // Mock RPC for wallet deduction
    mockServiceSupabase.rpc = jest.fn().mockImplementation((func, args) => {
        if (func === 'increment_wallet_balance') {
            db.wallets[0].balance += args.amount;
        }
        return { error: null };
    });

    const req = new NextRequest('http://localhost/api/webhooks/vapi', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const res = await vapiWebhookPOST(req);
    expect(res.status).toBe(200);

    // Verify Usage Updated
    expect(db.billing_usage_periods[0].voice_minutes_used).toBe(238 + 5); // 243 total
    
    // Verify Wallet Deduction
    // 3 mins overage * $0.35 = $1.05 = 105 cents
    expect(db.wallets[0].balance).toBe(1000 - 105);
  });
});
