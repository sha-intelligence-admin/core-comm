import { POST } from '@/app/api/webhooks/vapi/route';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { IntegrationFactory } from '@/lib/integrations/factory';

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

const { NextRequest } = require('next/server');

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn(),
}));

jest.mock('@/lib/integrations/factory', () => ({
  IntegrationFactory: {
    getProvider: jest.fn(),
  },
}));

describe('Vapi Webhook API', () => {
  let mockSupabase: any;
  let mockProvider: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      then: jest.fn(), // Make it awaitable
    };
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

    mockProvider = {
      executeAction: jest.fn(),
    };
    (IntegrationFactory.getProvider as jest.Mock).mockReturnValue(mockProvider);
  });

  it('should handle function-call event and route to active integration', async () => {
    // Mock request payload
    const payload = {
      message: {
        type: 'function-call',
        call: { id: 'call_123', assistantId: 'asst_123' },
        functionCall: {
          name: 'bookAppointment',
          parameters: { date: '2025-01-01' },
        },
      },
    };

    const req = new NextRequest('http://localhost/api/webhooks/vapi', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Mock Supabase responses
    // 1. Get assistant -> company_id (via single())
    mockSupabase.single.mockResolvedValueOnce({
      data: { company_id: 'comp_123' },
      error: null,
    });

    // 2. Get active integrations (via await eq())
    // We need to mock the 'then' method to resolve with the integrations data
    mockSupabase.then.mockImplementation((resolve: any) => {
      resolve({
        data: [{ type: 'webhook', config: { url: 'https://example.com' } }],
        error: null,
      });
    });

    // Mock Integration execution
    mockProvider.executeAction.mockResolvedValue({ success: true });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.result).toEqual({ success: true });
    
    // Verify Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith('vapi_assistants');
    expect(mockSupabase.from).toHaveBeenCalledWith('integrations');
    
    // Verify Integration execution
    expect(IntegrationFactory.getProvider).toHaveBeenCalledWith('webhook');
    expect(mockProvider.executeAction).toHaveBeenCalledWith(
      { url: 'https://example.com' },
      'bookAppointment',
      { date: '2025-01-01' }
    );
  });

  it('should return error if assistant not found', async () => {
    const payload = {
      message: {
        type: 'function-call',
        call: { id: 'call_123', assistantId: 'asst_unknown' },
        functionCall: { name: 'test', parameters: {} },
      },
    };

    const req = new NextRequest('http://localhost/api/webhooks/vapi', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' },
    });

    const response = await POST(req);
    const json = await response.json();

    expect(json.data.result.status).toBe('error');
    expect(json.data.result.message).toBe('Assistant not found');
  });
});
