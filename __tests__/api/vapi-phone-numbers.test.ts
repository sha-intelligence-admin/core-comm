
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/vapi/phone-numbers/route';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPhoneNumber } from '@/lib/vapi/phone-numbers';
import { purchaseTwilioPhoneNumberByAreaCode } from '@/lib/twilio/client';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/vapi/phone-numbers', () => ({
  createPhoneNumber: jest.fn(),
  listPhoneNumbers: jest.fn(),
}));

jest.mock('@/lib/twilio/client', () => ({
  purchaseTwilioPhoneNumberByAreaCode: jest.fn(),
}));

describe('Vapi Phone Numbers API', () => {
  let mockSupabase: any;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv }; // Reset env vars

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (purchaseTwilioPhoneNumberByAreaCode as jest.Mock).mockResolvedValue({ phoneNumber: '+14155550100' });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('POST /api/vapi/phone-numbers', () => {
    it('should inject Twilio credentials from env if missing in payload', async () => {
      // Setup env vars
      process.env.TWILIO_ACCOUNT_SID = 'env-sid';
      process.env.TWILIO_AUTH_TOKEN = 'env-token';

      // Mock auth and user profile
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockSupabase.single
        .mockResolvedValueOnce({ data: { company_id: 'company-123', role: 'admin' } }); // User profile

      // Mock createPhoneNumber success
      (createPhoneNumber as jest.Mock).mockResolvedValue({ id: 'new-phone' });

      const req = new NextRequest('http://localhost/api/vapi/phone-numbers', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'twilio',
          areaCode: '415'
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      
      // Verify createPhoneNumber was called with injected credentials
      expect(createPhoneNumber).toHaveBeenCalledWith(
        'company-123',
        expect.objectContaining({
          provider: 'twilio',
          number: '+14155550100',
          twilioAccountSid: 'env-sid',
          twilioAuthToken: 'env-token'
        })
      );
    });

    it('should NOT overwrite Twilio credentials if provided in payload', async () => {
      // Setup env vars
      process.env.TWILIO_ACCOUNT_SID = 'env-sid';
      process.env.TWILIO_AUTH_TOKEN = 'env-token';

      // Mock auth and user profile
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockSupabase.single
        .mockResolvedValueOnce({ data: { company_id: 'company-123', role: 'admin' } });

      // Mock createPhoneNumber success
      (createPhoneNumber as jest.Mock).mockResolvedValue({ id: 'new-phone' });

      const req = new NextRequest('http://localhost/api/vapi/phone-numbers', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'twilio',
          areaCode: '415',
          twilioAccountSid: 'payload-sid',
          twilioAuthToken: 'payload-token'
        }),
      });

      const res = await POST(req);
      
      // Verify createPhoneNumber was called with payload credentials
      expect(createPhoneNumber).toHaveBeenCalledWith(
        'company-123',
        expect.objectContaining({
          provider: 'twilio',
          number: '+14155550100',
          twilioAccountSid: 'payload-sid',
          twilioAuthToken: 'payload-token'
        })
      );
    });

    it('should not inject credentials for non-twilio providers', async () => {
        // Setup env vars
        process.env.TWILIO_ACCOUNT_SID = 'env-sid';
        process.env.TWILIO_AUTH_TOKEN = 'env-token';
  
        // Mock auth and user profile
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
        mockSupabase.single
          .mockResolvedValueOnce({ data: { company_id: 'company-123', role: 'admin' } });
  
        // Mock createPhoneNumber success
        (createPhoneNumber as jest.Mock).mockResolvedValue({ id: 'new-phone' });
  
        const req = new NextRequest('http://localhost/api/vapi/phone-numbers', {
          method: 'POST',
          body: JSON.stringify({
            provider: 'vapi',
            areaCode: '415'
          }),
        });
  
        const res = await POST(req);
        
        // Verify createPhoneNumber was called WITHOUT injected credentials
        expect(createPhoneNumber).toHaveBeenCalledWith(
          'company-123',
          expect.objectContaining({
            provider: 'vapi',
            areaCode: '415'
          })
        );
        
        const callArgs = (createPhoneNumber as jest.Mock).mock.calls[0][1];
        expect(callArgs.twilioAccountSid).toBeUndefined();
        expect(callArgs.twilioAuthToken).toBeUndefined();
      });
  });
});
