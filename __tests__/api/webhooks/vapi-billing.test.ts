import { POST } from '@/app/api/webhooks/vapi/route';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// Mock NextRequest and NextResponse
jest.mock('next/server', () => {
  return {
    NextRequest: class {
      url: string;
      method: string;
      body: any;
      headers: any;
      constructor(url: string, init: any) {
        this.url = url;
        this.method = init.method;
        this.body = init.body;
        this.headers = { get: () => null };
      }
      json() {
        return Promise.resolve(JSON.parse(this.body));
      }
    },
    NextResponse: {
      json: (body: any, init: any) => ({
        json: () => Promise.resolve(body),
        status: init?.status || 200,
      }),
    },
  };
});

// Mock global Response
global.Response = class {
  body: any;
  status: number;
  headers: any;
  constructor(body: any, init: any) {
    this.body = body;
    this.status = init?.status || 200;
    this.headers = init?.headers;
  }
  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
} as any;

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn(),
}));

describe('Vapi Webhook - Billing Enforcement', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  const createAssistantRequest = (phoneNumber: string) => {
    return new NextRequest('http://localhost/api/webhooks/vapi', {
      method: 'POST',
      body: JSON.stringify({
        message: {
          type: 'assistant-request',
          call: {
            phoneNumber: { number: phoneNumber },
          },
        },
      }),
    });
  };

  it('should allow call if wallet has positive balance', async () => {
    const phoneNumber = '+1234567890';
    const req = createAssistantRequest(phoneNumber);

    // 1. Mock Phone Number Lookup
    mockSupabase.single.mockResolvedValueOnce({
      data: {
        company_id: 'comp_123',
        vapi_assistants: {
          model_config: { model: 'gpt-4' },
          voice_config: { voiceId: 'voice_123' },
          first_message: 'Hello',
          system_prompt: 'System prompt',
        },
      },
      error: null,
    });

    // 2. Mock Wallet Lookup (Positive Balance)
    mockSupabase.single.mockResolvedValueOnce({
      data: { balance: 1000 }, // $10.00
      error: null,
    });

    // 3. Mock Subscription Lookup
    mockSupabase.single.mockResolvedValueOnce({
      data: { status: 'active', plan_id: 'starter' },
      error: null,
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.assistant).toBeDefined();
    expect(json.data.assistant.firstMessage).toBe('Hello');
  });

  it('should reject call if wallet has zero balance and not enterprise', async () => {
    const phoneNumber = '+1234567890';
    const req = createAssistantRequest(phoneNumber);

    // 1. Mock Phone Number Lookup
    mockSupabase.single.mockResolvedValueOnce({
      data: {
        company_id: 'comp_123',
        vapi_assistants: {
          model_config: {},
          voice_config: {},
        },
      },
      error: null,
    });

    // 2. Mock Wallet Lookup (Zero Balance)
    mockSupabase.single.mockResolvedValueOnce({
      data: { balance: 0 },
      error: null,
    });

    // 3. Mock Subscription Lookup (Not Enterprise)
    mockSupabase.single.mockResolvedValueOnce({
      data: { status: 'active', plan_id: 'starter' },
      error: null,
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.assistant.firstMessage).toContain('insufficient funds');
    expect(json.data.assistant.endCallAfterSpoken).toBe(true);
  });

  it('should allow call if wallet has zero balance BUT is enterprise', async () => {
    const phoneNumber = '+1234567890';
    const req = createAssistantRequest(phoneNumber);

    // 1. Mock Phone Number Lookup
    mockSupabase.single.mockResolvedValueOnce({
      data: {
        company_id: 'comp_123',
        vapi_assistants: {
          first_message: 'Hello Enterprise',
        },
      },
      error: null,
    });

    // 2. Mock Wallet Lookup (Zero Balance)
    mockSupabase.single.mockResolvedValueOnce({
      data: { balance: 0 },
      error: null,
    });

    // 3. Mock Subscription Lookup (Enterprise)
    mockSupabase.single.mockResolvedValueOnce({
      data: { status: 'active', plan_id: 'enterprise' },
      error: null,
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.assistant.firstMessage).toBe('Hello Enterprise');
    expect(json.data.assistant.endCallAfterSpoken).toBeUndefined();
  });
});
