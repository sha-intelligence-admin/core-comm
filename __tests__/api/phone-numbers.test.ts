
/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/phone-numbers/route';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkProvisioningLimit } from '@/lib/billing/usage-tracker';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/billing/usage-tracker', () => ({
  checkProvisioningLimit: jest.fn(),
}));

describe('Phone Numbers API', () => {
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
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (checkProvisioningLimit as jest.Mock).mockResolvedValue({ allowed: true, limit: 10, current: 0 });
  });

  describe('GET /api/phone-numbers', () => {
    it('should return 401 if unauthorized', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: 'Auth error' });

      const req = new NextRequest('http://localhost/api/phone-numbers');
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 403 if user has no company', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockSupabase.single.mockResolvedValue({ data: null, error: 'No company' });

      const req = new NextRequest('http://localhost/api/phone-numbers');
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toBe('User company not found');
    });

    it('should list phone numbers', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      // Mock user company lookup
      mockSupabase.single.mockResolvedValueOnce({ data: { company_id: 'company-123' } });
      
      // Mock phone numbers list
      const mockNumbers = [{ id: 'pn-1', phone_number: '+1234567890' }];
      mockSupabase.range.mockResolvedValue({ data: mockNumbers, count: 1, error: null });

      const req = new NextRequest('http://localhost/api/phone-numbers?page=1&limit=10');
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.phoneNumbers).toHaveLength(1);
      expect(json.pagination.total).toBe(1);
    });
  });

  describe('POST /api/phone-numbers', () => {
    it('should create a new phone number', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      // Mock user company lookup
      mockSupabase.single.mockResolvedValueOnce({ data: { company_id: 'company-123' } });
      
      // Mock existing check (not found)
      mockSupabase.single.mockResolvedValueOnce({ data: null });

      // Mock insert
      const newNumber = { 
        id: 'pn-new', 
        phone_number: '+1987654321',
        company_id: 'company-123'
      };
      mockSupabase.single.mockResolvedValueOnce({ data: newNumber, error: null });

      const req = new NextRequest('http://localhost/api/phone-numbers', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: '+1987654321',
          friendly_name: 'Support Line',
          provider: 'twilio'
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.phoneNumber).toEqual(newNumber);
      
      // Verify insert call
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        phone_number: '+1987654321',
        company_id: 'company-123',
        created_by: 'user-123'
      }));
    });

    it('should return 409 if phone number already exists', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockSupabase.single.mockResolvedValueOnce({ data: { company_id: 'company-123' } });
      
      // Mock existing check (found)
      mockSupabase.single.mockResolvedValueOnce({ data: { id: 'existing-id' } });

      const req = new NextRequest('http://localhost/api/phone-numbers', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: '+1987654321'
        }),
      });

      const res = await POST(req);
      
      expect(res.status).toBe(409);
    });

    it('should validate input', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockSupabase.single.mockResolvedValueOnce({ data: { company_id: 'company-123' } });

      const req = new NextRequest('http://localhost/api/phone-numbers', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: '123' // Too short
        }),
      });

      const res = await POST(req);
      const json = await res.json();
      
      expect(res.status).toBe(400);
      expect(json.error).toBe('Invalid input');
    });
  });
});
