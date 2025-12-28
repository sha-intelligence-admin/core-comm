
/**
 * @jest-environment node
 */
import { POST as purchaseAddonPOST } from '@/app/api/billing/purchase-addon/route';
import { POST as createPhoneNumberPOST } from '@/app/api/phone-numbers/route';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Billing Add-ons & Limits', () => {
  let mockSupabase: any;
  let db: any = {
    users: [{ id: 'user-123', company_id: 'company-123' }],
    wallets: [{ id: 'wallet-123', company_id: 'company-123', balance: 2000 }], // $20.00
    billing_subscriptions: [{ id: 'sub-123', company_id: 'company-123', plan_id: 'starter', status: 'active' }],
    billing_addons: [],
    phone_numbers: [{ id: 'pn-1', company_id: 'company-123', status: 'active' }], // 1 number used
  };

  beforeEach(() => {
    jest.clearAllMocks();
    db.billing_addons = [];
    db.phone_numbers = [{ id: 'pn-1', company_id: 'company-123', status: 'active' }];
    db.wallets[0].balance = 2000;

    // Helper to create a chainable mock
    const createBuilder = (table: string) => {
      const builder: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        single: jest.fn(),
        then: (resolve: any) => resolve({ data: null, error: null })
      };

      if (table === 'users') {
        builder.single.mockResolvedValue({ data: db.users[0] });
      }
      if (table === 'wallets') {
        builder.single.mockResolvedValue({ data: db.wallets[0] });
      }
      if (table === 'billing_subscriptions') {
        builder.single.mockResolvedValue({ data: db.billing_subscriptions[0] });
      }
      if (table === 'billing_addons') {
        builder.insert = jest.fn((data) => {
            db.billing_addons.push(data);
            return builder;
        });
        builder.then = (resolve: any) => resolve({ data: db.billing_addons, error: null });
      }
      if (table === 'phone_numbers') {
        // Handle count query vs insert vs exists check
        builder.select = jest.fn((cols, opts) => {
            if (opts?.count) builder._isCount = true;
            return builder;
        });
        builder.single = jest.fn().mockResolvedValue({ data: null }); // For "exists" check (return null = not found)
        builder.insert = jest.fn((data) => {
            db.phone_numbers.push(data);
            builder._insertedData = data;
            return builder;
        });
        builder.then = (resolve: any) => {
            if (builder._isCount) {
                resolve({ count: db.phone_numbers.length, data: null, error: null });
            } else if (builder._insertedData) {
                resolve({ data: builder._insertedData, error: null });
            } else {
                resolve({ data: null, error: null });
            }
        };
      }

      return builder;
    };

    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
      from: jest.fn((table) => createBuilder(table)),
      rpc: jest.fn().mockImplementation(async (func, args) => {
        if (func === 'increment_wallet_balance') {
          db.wallets[0].balance += args.amount;
        }
        return { error: null };
      }),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it('1. Enforce Limit: Cannot create 2nd phone number on Starter plan', async () => {
    // Starter plan limit is 1. We already have 1 in db.phone_numbers.
    
    const req = new NextRequest('http://localhost/api/phone-numbers', {
      method: 'POST',
      body: JSON.stringify({ phone_number: '+15550000002' }),
    });

    const res = await createPhoneNumberPOST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Phone number limit reached');
  });

  it('2. Purchase Add-on: Buy extra phone number', async () => {
    const req = new NextRequest('http://localhost/api/billing/purchase-addon', {
      method: 'POST',
      body: JSON.stringify({ companyId: 'company-123', addonId: 'phone_number' }),
    });

    const res = await purchaseAddonPOST(req);
    expect(res.status).toBe(200);

    // Verify Wallet Deduction ($15 = 1500 cents)
    expect(db.wallets[0].balance).toBe(2000 - 1500); // 500 left

    // Verify Add-on Created
    expect(db.billing_addons).toHaveLength(1);
    expect(db.billing_addons[0].type).toBe('phone_number');
  });

  it('3. Enforce Limit: Can create 2nd phone number AFTER purchasing add-on', async () => {
    // Add the add-on manually to DB state
    db.billing_addons.push({ type: 'phone_number', quantity: 1, status: 'active', company_id: 'company-123' });

    const req = new NextRequest('http://localhost/api/phone-numbers', {
      method: 'POST',
      body: JSON.stringify({ phone_number: '+15550000002' }),
    });

    const res = await createPhoneNumberPOST(req);
    expect(res.status).toBe(201); // Created
  });
});