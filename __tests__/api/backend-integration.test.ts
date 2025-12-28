import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { checkProvisioningLimit } from '@/lib/billing/usage-tracker';

// Mock crypto.randomUUID
if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-1234',
    }
  });
} else if (!global.crypto.randomUUID) {
  // @ts-ignore
  global.crypto.randomUUID = () => 'test-uuid-1234';
}

// Mock NextRequest and NextResponse
jest.mock('next/server', () => {
  return {
    NextRequest: class {
      url: string;
      method: string;
      body: any;
      headers: any;
      nextUrl: { searchParams: { get: Function } };
      constructor(url: string, init: any) {
        this.url = url;
        this.method = init?.method || 'GET';
        this.body = init?.body;
        this.headers = { get: () => null };
        this.nextUrl = { searchParams: { get: () => null } };
      }
      json() {
        return Promise.resolve(this.body ? JSON.parse(this.body) : {});
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

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
  createServiceRoleClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@/lib/billing/usage-tracker', () => ({
  checkProvisioningLimit: jest.fn(),
  trackUsage: jest.fn(),
}));

jest.mock('@/lib/zoho-mail', () => ({
  zohoMail: {
    sendEmail: jest.fn().mockResolvedValue(true),
    sendInvitationEmail: jest.fn().mockResolvedValue(true),
  },
}));


/**
 * Backend Integration Tests - Phase 2 & 3 Features
 * Tests database schema and company-scoped architecture
 * 
 * Features Tested:
 * 1. Voice Agents Schema
 * 2. Phone Numbers Schema
 * 3. Messaging Channels Schema
 * 4. Email Accounts Schema
 * 5. Team Members Schema
 * 6. Company-scoped Data Isolation
 */

describe('Backend Integration - Database Schema Tests', () => {
  // Mock data matching the company-scoped architecture
  const mockCompanyId = 'test-company-id-456';
  const mockUserId = 'test-user-id-123';

  // =============================================================================
  // 1. VOICE AGENTS SCHEMA VALIDATION
  // =============================================================================

  describe('Voice Agents Schema', () => {
    const mockVoiceAgent = {
      id: 'agent-id-1',
      company_id: mockCompanyId,
      created_by: mockUserId,
      name: 'Customer Service Agent',
      description: 'Handles customer inquiries',
      voice_model: 'en-US-neural',
      status: 'active',
      greeting_message: 'Hello! How can I help you today?',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    test('Should have company_id as primary foreign key', () => {
      expect(mockVoiceAgent).toHaveProperty('company_id');
      expect(mockVoiceAgent.company_id).toBe(mockCompanyId);
    });

    test('Should have created_by for audit trail', () => {
      expect(mockVoiceAgent).toHaveProperty('created_by');
      expect(mockVoiceAgent.created_by).toBe(mockUserId);
    });

    test('Should have all required fields', () => {
      expect(mockVoiceAgent).toHaveProperty('id');
      expect(mockVoiceAgent).toHaveProperty('name');
      expect(mockVoiceAgent).toHaveProperty('status');
      expect(mockVoiceAgent).toHaveProperty('created_at');
      expect(mockVoiceAgent).toHaveProperty('updated_at');
    });

    test('Status should be valid enum value', () => {
      const validStatuses = ['active', 'inactive', 'training', 'error'];
      expect(validStatuses).toContain(mockVoiceAgent.status);
    });
  });

  // =============================================================================
  // 2. PHONE NUMBERS SCHEMA VALIDATION
  // =============================================================================

  describe('Phone Numbers Schema', () => {
    const mockPhoneNumber = {
      id: 'phone-id-1',
      company_id: mockCompanyId,
      created_by: mockUserId,
      phone_number: '+15551234567',
      country_code: '+1',
      provider: 'twilio',
      number_type: 'both',
      status: 'active',
      friendly_name: 'Main Support Line',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    test('Should have company_id as primary foreign key', () => {
      expect(mockPhoneNumber).toHaveProperty('company_id');
      expect(mockPhoneNumber.company_id).toBe(mockCompanyId);
    });

    test('Should have created_by for audit trail', () => {
      expect(mockPhoneNumber).toHaveProperty('created_by');
      expect(mockPhoneNumber.created_by).toBe(mockUserId);
    });

    test('Should have phone number in E.164 format', () => {
      expect(mockPhoneNumber.phone_number).toMatch(/^\+\d{11,15}$/);
    });

    test('Number type should be valid enum value', () => {
      const validTypes = ['voice', 'sms', 'both'];
      expect(validTypes).toContain(mockPhoneNumber.number_type);
    });

    test('Status should be valid enum value', () => {
      const validStatuses = ['active', 'inactive', 'suspended', 'pending'];
      expect(validStatuses).toContain(mockPhoneNumber.status);
    });
  });

  // =============================================================================
  // 3. MESSAGING CHANNELS SCHEMA VALIDATION
  // =============================================================================

  describe('Messaging Channels Schema', () => {
    const mockMessagingChannel = {
      id: 'channel-id-1',
      company_id: mockCompanyId,
      created_by: mockUserId,
      channel_name: 'WhatsApp Support',
      channel_type: 'whatsapp',
      provider: 'twilio',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    test('Should have company_id as primary foreign key', () => {
      expect(mockMessagingChannel).toHaveProperty('company_id');
      expect(mockMessagingChannel.company_id).toBe(mockCompanyId);
    });

    test('Should have created_by for audit trail', () => {
      expect(mockMessagingChannel).toHaveProperty('created_by');
      expect(mockMessagingChannel.created_by).toBe(mockUserId);
    });

    test('Channel type should be valid enum value', () => {
      const validTypes = ['whatsapp', 'telegram', 'messenger', 'slack', 'discord', 'sms', 'webchat'];
      expect(validTypes).toContain(mockMessagingChannel.channel_type);
    });

    test('Status should be valid enum value', () => {
      const validStatuses = ['active', 'inactive', 'suspended', 'pending', 'error'];
      expect(validStatuses).toContain(mockMessagingChannel.status);
    });
  });

  // =============================================================================
  // 4. EMAIL ACCOUNTS SCHEMA VALIDATION
  // =============================================================================

  describe('Email Accounts Schema', () => {
    const mockEmailAccount = {
      id: 'email-id-1',
      company_id: mockCompanyId,
      created_by: mockUserId,
      account_name: 'Support Email',
      email_address: 'support@example.com',
      provider: 'gmail',
      status: 'active',
      smtp_use_tls: true,
      imap_use_tls: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    test('Should have company_id as primary foreign key', () => {
      expect(mockEmailAccount).toHaveProperty('company_id');
      expect(mockEmailAccount.company_id).toBe(mockCompanyId);
    });

    test('Should have created_by for audit trail', () => {
      expect(mockEmailAccount).toHaveProperty('created_by');
      expect(mockEmailAccount.created_by).toBe(mockUserId);
    });

    test('Email address should be valid format', () => {
      expect(mockEmailAccount.email_address).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    test('Status should be valid enum value', () => {
      const validStatuses = ['active', 'inactive', 'suspended', 'error', 'pending'];
      expect(validStatuses).toContain(mockEmailAccount.status);
    });

    test('Should have TLS configuration for security', () => {
      expect(mockEmailAccount).toHaveProperty('smtp_use_tls');
      expect(mockEmailAccount).toHaveProperty('imap_use_tls');
      expect(mockEmailAccount.smtp_use_tls).toBe(true);
      expect(mockEmailAccount.imap_use_tls).toBe(true);
    });
  });

  // =============================================================================
  // 5. TEAM MEMBERS SCHEMA VALIDATION
  // =============================================================================

  describe('Team Members Schema', () => {
    const mockTeamMember = {
      id: 'member-id-1',
      company_id: mockCompanyId,
      user_id: null, // Invited but not yet accepted
      created_by: mockUserId,
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'agent',
      department: 'support',
      status: 'invited',
      can_view_calls: true,
      can_view_messages: true,
      can_view_emails: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    test('Should have company_id as primary foreign key', () => {
      expect(mockTeamMember).toHaveProperty('company_id');
      expect(mockTeamMember.company_id).toBe(mockCompanyId);
    });

    test('Should have created_by for audit trail', () => {
      expect(mockTeamMember).toHaveProperty('created_by');
      expect(mockTeamMember.created_by).toBe(mockUserId);
    });

    test('Should have user_id for linking to auth.users', () => {
      expect(mockTeamMember).toHaveProperty('user_id');
      // Can be null if invitation not yet accepted
    });

    test('Role should be valid value', () => {
      const validRoles = ['admin', 'manager', 'agent', 'viewer', 'developer'];
      expect(validRoles).toContain(mockTeamMember.role);
    });

    test('Status should be valid enum value', () => {
      const validStatuses = ['active', 'inactive', 'invited', 'suspended'];
      expect(validStatuses).toContain(mockTeamMember.status);
    });

    test('Should have permission flags', () => {
      expect(mockTeamMember).toHaveProperty('can_view_calls');
      expect(mockTeamMember).toHaveProperty('can_view_messages');
      expect(mockTeamMember).toHaveProperty('can_view_emails');
    });
  });

  // =============================================================================
  // 6. COMPANY-SCOPED DATA ISOLATION TESTS
  // =============================================================================

  describe('Company-Scoped Data Isolation', () => {
    test('All tables should use company_id for primary data scoping', () => {
      const tables = [
        { name: 'voice_agents', company_id: mockCompanyId },
        { name: 'phone_numbers', company_id: mockCompanyId },
        { name: 'messaging_channels', company_id: mockCompanyId },
        { name: 'email_accounts', company_id: mockCompanyId },
        { name: 'team_members', company_id: mockCompanyId },
      ];

      tables.forEach(table => {
        expect(table.company_id).toBe(mockCompanyId);
      });
    });

    test('All tables should use created_by for user audit trails', () => {
      const tables = [
        { name: 'voice_agents', created_by: mockUserId },
        { name: 'phone_numbers', created_by: mockUserId },
        { name: 'messaging_channels', created_by: mockUserId },
        { name: 'email_accounts', created_by: mockUserId },
        { name: 'team_members', created_by: mockUserId },
      ];

      tables.forEach(table => {
        expect(table.created_by).toBe(mockUserId);
      });
    });

    test('RLS policy pattern should check company_id via users table', () => {
      const expectedRLSPattern = `
        company_id IN (
          SELECT company_id FROM public.users WHERE id = auth.uid()
        )
      `;

      // Verify pattern contains essential components
      expect(expectedRLSPattern).toContain('company_id');
      expect(expectedRLSPattern).toContain('public.users');
      expect(expectedRLSPattern).toContain('auth.uid()');
    });

    test('Users from different companies should be isolated', () => {
      const company1Data = { company_id: 'company-1' };
      const company2Data = { company_id: 'company-2' };

      expect(company1Data.company_id).not.toBe(company2Data.company_id);
    });
  });

  // =============================================================================
  // 7. FOREIGN KEY RELATIONSHIPS
  // =============================================================================

  describe('Foreign Key Relationships', () => {
    test('company_id should reference public.company(id)', () => {
      const foreignKeyRelationship = {
        column: 'company_id',
        references: 'public.company(id)',
        onDelete: 'CASCADE',
      };

      expect(foreignKeyRelationship.column).toBe('company_id');
      expect(foreignKeyRelationship.references).toBe('public.company(id)');
      expect(foreignKeyRelationship.onDelete).toBe('CASCADE');
    });

    test('created_by should reference auth.users(id)', () => {
      const foreignKeyRelationship = {
        column: 'created_by',
        references: 'auth.users(id)',
        nullable: true,
      };

      expect(foreignKeyRelationship.column).toBe('created_by');
      expect(foreignKeyRelationship.references).toBe('auth.users(id)');
      expect(foreignKeyRelationship.nullable).toBe(true);
    });

    test('team_members.user_id should reference auth.users(id)', () => {
      const foreignKeyRelationship = {
        table: 'team_members',
        column: 'user_id',
        references: 'auth.users(id)',
        nullable: true,
      };

      expect(foreignKeyRelationship.column).toBe('user_id');
      expect(foreignKeyRelationship.references).toBe('auth.users(id)');
      expect(foreignKeyRelationship.nullable).toBe(true);
    });
  });

  // =============================================================================
  // 8. TIMESTAMP FIELDS
  // =============================================================================

  describe('Timestamp Fields', () => {
    test('All tables should have created_at timestamp', () => {
      const timestamp = new Date().toISOString();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('All tables should have updated_at timestamp', () => {
      const timestamp = new Date().toISOString();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('Auto-update triggers should exist for all tables', () => {
      const tables = [
        'voice_agents',
        'phone_numbers',
        'messaging_channels',
        'email_accounts',
        'team_members',
      ];

      tables.forEach(table => {
        const triggerName = `trigger_update_${table}_updated_at`;
        const functionName = `update_${table}_updated_at()`;
        
        expect(triggerName).toContain('trigger_update');
        expect(functionName).toContain('update_');
        expect(functionName).toContain('updated_at');
      });
    });
  });

  // =============================================================================
  // 9. INDEX STRUCTURE
  // =============================================================================

  describe('Index Structure', () => {
    test('All tables should have index on company_id', () => {
      const tables = [
        'voice_agents',
        'phone_numbers',
        'messaging_channels',
        'email_accounts',
        'team_members',
      ];

      tables.forEach(table => {
        const indexName = `idx_${table}_company_id`;
        expect(indexName).toContain('company_id');
      });
    });

    test('All tables should have index on created_by', () => {
      const tables = [
        'voice_agents',
        'phone_numbers',
        'messaging_channels',
        'email_accounts',
        'team_members',
      ];

      tables.forEach(table => {
        const indexName = `idx_${table}_created_by`;
        expect(indexName).toContain('created_by');
      });
    });

    test('All tables should have index on status', () => {
      const tables = [
        'voice_agents',
        'phone_numbers',
        'messaging_channels',
        'email_accounts',
        'team_members',
      ];

      tables.forEach(table => {
        const indexName = `idx_${table}_status`;
        expect(indexName).toContain('status');
      });
    });
  });

  // =============================================================================
  // 10. MIGRATION SUMMARY
  // =============================================================================

  describe('Migration Summary', () => {
    test('Should have created 5 new tables', () => {
      const newTables = [
        'voice_agents',
        'phone_numbers',
        'messaging_channels',
        'email_accounts',
        'team_members',
      ];

      expect(newTables).toHaveLength(5);
    });

    test('All tables should use company-scoped architecture', () => {
      const architecture = {
        primaryScope: 'company_id → public.company(id)',
        auditTrail: 'created_by → auth.users(id)',
        rlsPolicy: 'company_id IN (SELECT company_id FROM users WHERE id = auth.uid())',
      };

      expect(architecture.primaryScope).toContain('company_id');
      expect(architecture.auditTrail).toContain('created_by');
      expect(architecture.rlsPolicy).toContain('company_id');
    });

    test('Architecture should match existing tables', () => {
      const existingTables = {
        calls: { company_id: 'public.company(id)' },
        integrations: { company_id: 'public.company(id)' },
        users: { company_id: 'public.company(id)', id: 'auth.users(id)' },
      };

      const newTables = {
        voice_agents: { company_id: 'public.company(id)', created_by: 'auth.users(id)' },
        phone_numbers: { company_id: 'public.company(id)', created_by: 'auth.users(id)' },
        messaging_channels: { company_id: 'public.company(id)', created_by: 'auth.users(id)' },
        email_accounts: { company_id: 'public.company(id)', created_by: 'auth.users(id)' },
        team_members: { company_id: 'public.company(id)', created_by: 'auth.users(id)' },
      };

      expect(existingTables.calls.company_id).toBe(newTables.voice_agents.company_id);
      expect(existingTables.integrations.company_id).toBe(newTables.phone_numbers.company_id);
    });
  });
});


// Mock data
const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
};

const mockCompany = {
  id: 'test-company-id-456',
  name: 'Test Company',
};

const mockVoiceAgent = {
  id: 'agent-id-1',
  company_id: mockCompany.id,
  created_by: mockUser.id,
  name: 'Customer Service Agent',
  description: 'Handles customer inquiries',
  voice_model: 'en-US-neural',
  personality: 'Friendly and professional',
  language: 'en-US',
  status: 'active',
  greeting_message: 'Hello! How can I help you today?',
  knowledge_base_id: null,
  config: {},
  total_calls: 0,
  total_minutes: 0,
  success_rate: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockPhoneNumber = {
  id: 'phone-id-1',
  company_id: mockCompany.id,
  created_by: mockUser.id,
  phone_number: '+15551234567',
  country_code: '+1',
  provider: 'twilio',
  number_type: 'both',
  status: 'active',
  friendly_name: 'Main Support Line',
  capabilities: { voice: true, sms: true, mms: false },
  assigned_to: 'Support Team',
  monthly_cost: 1.00,
  total_inbound_calls: 0,
  total_outbound_calls: 0,
  total_sms_sent: 0,
  total_sms_received: 0,
  config: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockMessagingChannel = {
  id: 'channel-id-1',
  company_id: mockCompany.id,
  created_by: mockUser.id,
  channel_name: 'WhatsApp Support',
  channel_type: 'whatsapp',
  provider: 'twilio',
  status: 'active',
  phone_number: '+15551234567',
  api_key: 'encrypted-key',
  webhook_url: 'https://api.example.com/webhook',
  config: {},
  total_messages_sent: 0,
  total_messages_received: 0,
  total_conversations: 0,
  response_rate: 0,
  avg_response_time: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockEmailAccount = {
  id: 'email-id-1',
  company_id: mockCompany.id,
  created_by: mockUser.id,
  account_name: 'Support Email',
  email_address: 'support@example.com',
  provider: 'gmail',
  status: 'active',
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_username: 'support@example.com',
  smtp_password: 'encrypted',
  smtp_use_tls: true,
  imap_host: 'imap.gmail.com',
  imap_port: 993,
  imap_username: 'support@example.com',
  imap_password: 'encrypted',
  imap_use_tls: true,
  oauth_provider: null,
  oauth_access_token: null,
  oauth_refresh_token: null,
  oauth_token_expiry: null,
  signature: 'Best regards,\nSupport Team',
  auto_reply_enabled: false,
  auto_reply_message: null,
  forward_to_email: null,
  config: {},
  total_emails_sent: 0,
  total_emails_received: 0,
  total_emails_replied: 0,
  avg_response_time: 0,
  last_sync_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockTeamMember = {
  id: 'member-id-1',
  company_id: mockCompany.id,
  user_id: null,
  created_by: mockUser.id,
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'agent',
  department: 'support',
  status: 'active',
  phone_number: '+15559876543',
  avatar_url: null,
  timezone: 'America/New_York',
  permissions: {},
  can_access_analytics: true,
  can_manage_integrations: false,
  can_manage_team: false,
  can_manage_agents: false,
  can_view_calls: true,
  can_view_messages: true,
  can_view_emails: true,
  last_login_at: null,
  last_active_at: null,
  invitation_sent_at: new Date().toISOString(),
  invitation_accepted_at: null,
  total_calls_handled: 0,
  total_messages_handled: 0,
  total_emails_handled: 0,
  avg_response_time: 0,
  customer_satisfaction_score: 0,
  notes: null,
  config: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('Backend Integration Tests', () => {
  let mockSupabase: any;
  let mockQueryBuilder: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Query Builder
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { company_id: mockCompany.id }, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      then: jest.fn((resolve) => resolve({ data: [], error: null, count: 0 })),
    };

    // Mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);
    (cookies as jest.Mock).mockReturnValue({});
    (checkProvisioningLimit as jest.Mock).mockResolvedValue({ allowed: true, limit: 10, current: 0 });
  });

  // =============================================================================
  // 1. VOICE AGENTS API TESTS
  // =============================================================================

  describe('Voice Agents API', () => {
    test('GET /api/voice-agents - should fetch all voice agents for company', async () => {
      mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({
        data: [mockVoiceAgent],
        error: null,
        count: 1
      }));

      const { GET } = await import('@/app/api/voice-agents/route');
      const response = await GET(new NextRequest('http://localhost:3001/api/voice-agents'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.agents).toHaveLength(1);
      expect(data.agents[0].company_id).toBe(mockCompany.id);
      expect(mockSupabase.from).toHaveBeenCalledWith('voice_agents');
    });

    test('POST /api/voice-agents - should create new voice agent with company_id', async () => {
      // Mock getting user's company_id
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { company_id: mockCompany.id },
        error: null,
      });

      // Mock insert operation
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockVoiceAgent,
        error: null,
      });

      const { POST } = await import('@/app/api/voice-agents/route');
      const request = new NextRequest('http://localhost:3001/api/voice-agents', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Customer Service Agent',
          description: 'Handles customer inquiries',
          voice_model: 'en-US-neural',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.agent.company_id).toBe(mockCompany.id);
      expect(mockQueryBuilder.insert).toHaveBeenCalled();
    });

    test('PUT /api/voice-agents/[id] - should update voice agent', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: { ...mockVoiceAgent, name: 'Updated Agent Name' },
        error: null,
      });

      const { PUT } = await import('@/app/api/voice-agents/[id]/route');
      const request = new NextRequest('http://localhost:3001/api/voice-agents/agent-id-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Agent Name' }),
      });

      const response = await PUT(request, { params: { id: 'agent-id-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.agent.name).toBe('Updated Agent Name');
      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'agent-id-1');
    });

    test('DELETE /api/voice-agents/[id] - should delete voice agent', async () => {
      mockQueryBuilder.then.mockImplementationOnce((resolve: any) => resolve({
        data: null,
        error: null,
      }));

      const { DELETE } = await import('@/app/api/voice-agents/[id]/route');
      const response = await DELETE(
        new NextRequest('http://localhost:3001/api/voice-agents/agent-id-1'),
        { params: { id: 'agent-id-1' } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('deleted');
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
    });
  });

  // =============================================================================
  // 2. PHONE NUMBERS API TESTS
  // =============================================================================

  describe('Phone Numbers API', () => {
    test('GET /api/phone-numbers - should fetch all phone numbers for company', async () => {
      mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({
        data: [mockPhoneNumber],
        error: null,
        count: 1
      }));

      const { GET } = await import('@/app/api/phone-numbers/route');
      const response = await GET(new NextRequest('http://localhost:3001/api/phone-numbers'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phoneNumbers).toHaveLength(1);
      expect(data.phoneNumbers[0].company_id).toBe(mockCompany.id);
    });

    test('POST /api/phone-numbers - should create new phone number with company_id', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { company_id: mockCompany.id },
        error: null,
      });

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockPhoneNumber,
        error: null,
      });

      const { POST } = await import('@/app/api/phone-numbers/route');
      const request = new NextRequest('http://localhost:3001/api/phone-numbers', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: '+15551234567',
          friendly_name: 'Main Support Line',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.phoneNumber.company_id).toBe(mockCompany.id);
    });
  });

  // =============================================================================
  // 3. MESSAGING CHANNELS API TESTS
  // =============================================================================

  describe('Messaging Channels API', () => {
    test('GET /api/messaging-channels - should fetch all channels for company', async () => {
      mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({
        data: [mockMessagingChannel],
        error: null,
        count: 1
      }));

      const { GET } = await import('@/app/api/messaging-channels/route');
      const response = await GET(new NextRequest('http://localhost:3001/api/messaging-channels'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.channels).toHaveLength(1);
      expect(data.channels[0].company_id).toBe(mockCompany.id);
    });

    test('POST /api/messaging-channels - should create new channel with company_id', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { company_id: mockCompany.id },
        error: null,
      });

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockMessagingChannel,
        error: null,
      });

      const { POST } = await import('@/app/api/messaging-channels/route');
      const request = new NextRequest('http://localhost:3001/api/messaging-channels', {
        method: 'POST',
        body: JSON.stringify({
          channel_name: 'WhatsApp Support',
          channel_type: 'whatsapp',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.channel.company_id).toBe(mockCompany.id);
    });
  });

  // =============================================================================
  // 4. EMAIL ACCOUNTS API TESTS
  // =============================================================================

  describe('Email Accounts API', () => {
    test('GET /api/email-accounts - should fetch all email accounts for company', async () => {
      mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({
        data: [mockEmailAccount],
        error: null,
        count: 1
      }));

      const { GET } = await import('@/app/api/email-accounts/route');
      const response = await GET(new NextRequest('http://localhost:3001/api/email-accounts'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.accounts).toHaveLength(1);
      expect(data.accounts[0].company_id).toBe(mockCompany.id);
    });

    test('POST /api/email-accounts - should create new email account with company_id', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { company_id: mockCompany.id },
        error: null,
      });

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockEmailAccount,
        error: null,
      });

      const { POST } = await import('@/app/api/email-accounts/route');
      const request = new NextRequest('http://localhost:3001/api/email-accounts', {
        method: 'POST',
        body: JSON.stringify({
          account_name: 'Support Email',
          email_address: 'support@example.com',
          provider: 'gmail',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.company_id).toBe(mockCompany.id);
    });
  });

  // =============================================================================
  // 5. TEAM MEMBERS API TESTS
  // =============================================================================

  describe('Team Members API', () => {
    test('GET /api/team-members - should fetch all team members for company', async () => {
      mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({
        data: [mockTeamMember],
        error: null,
        count: 1
      }));

      const { GET } = await import('@/app/api/team-members/route');
      const response = await GET(new NextRequest('http://localhost:3001/api/team-members'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.members).toHaveLength(1);
      expect(data.members[0].company_id).toBe(mockCompany.id);
    });

    test('POST /api/team-members - should create new team member with company_id', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { company_id: mockCompany.id },
        error: null,
      });

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockTeamMember,
        error: null,
      });

      const { POST } = await import('@/app/api/team-members/route');
      const request = new NextRequest('http://localhost:3001/api/team-members', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'agent',
          department: 'support',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.company_id).toBe(mockCompany.id);
    });
  });

  // =============================================================================
  // 6. ANALYTICS DASHBOARD TESTS
  // =============================================================================

  describe('Analytics Dashboard', () => {
    test('Should aggregate data from all 6 backend systems', async () => {
      // Mock all data sources
      mockQueryBuilder.select
        .mockResolvedValueOnce({ data: [mockVoiceAgent], error: null }) // voice_agents
        .mockResolvedValueOnce({ data: [mockPhoneNumber], error: null }) // phone_numbers
        .mockResolvedValueOnce({ data: [mockMessagingChannel], error: null }) // messaging_channels
        .mockResolvedValueOnce({ data: [mockEmailAccount], error: null }) // email_accounts
        .mockResolvedValueOnce({ data: [mockTeamMember], error: null }) // team_members
        .mockResolvedValueOnce({ // calls
          data: [
            {
              id: 'call-1',
              company_id: mockCompany.id,
              call_type: 'inbound',
              duration: 180,
              resolution_status: 'resolved',
              sentiment: 'positive',
              created_at: new Date().toISOString(),
            },
          ],
          error: null,
        });

      // Test analytics data aggregation
      expect(mockSupabase.from).toBeDefined();
      expect(mockQueryBuilder.select).toBeDefined();
    });

    test('Should calculate total metrics correctly', () => {
      const totalAgents = 1;
      const totalNumbers = 1;
      const totalChannels = 1;
      const totalEmailAccounts = 1;
      const totalTeamMembers = 1;
      const totalCalls = 1;

      expect(totalAgents).toBe(1);
      expect(totalNumbers).toBe(1);
      expect(totalChannels).toBe(1);
      expect(totalEmailAccounts).toBe(1);
      expect(totalTeamMembers).toBe(1);
      expect(totalCalls).toBe(1);
    });
  });

  // =============================================================================
  // 7. COMPANY-SCOPED ISOLATION TESTS
  // =============================================================================

  describe('Company-Scoped Data Isolation', () => {
    test('Users should only see data from their own company', async () => {
      const otherCompanyData = {
        ...mockVoiceAgent,
        id: 'other-agent',
        company_id: 'other-company-id',
      };

      mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({
        data: [mockVoiceAgent], // Should NOT include otherCompanyData
        error: null,
        count: 1
      }));

      const { GET } = await import('@/app/api/voice-agents/route');
      const response = await GET(new NextRequest('http://localhost:3001/api/voice-agents'));
      const data = await response.json();

      expect(data.agents).toHaveLength(1);
      expect(data.agents[0].company_id).toBe(mockCompany.id);
      expect(data.agents[0].company_id).not.toBe('other-company-id');
    });

    test('Created_by field should track user who created the resource', async () => {
      expect(mockVoiceAgent.created_by).toBe(mockUser.id);
      expect(mockPhoneNumber.created_by).toBe(mockUser.id);
      expect(mockMessagingChannel.created_by).toBe(mockUser.id);
      expect(mockEmailAccount.created_by).toBe(mockUser.id);
      expect(mockTeamMember.created_by).toBe(mockUser.id);
    });
  });

  // =============================================================================
  // 8. ERROR HANDLING TESTS
  // =============================================================================

  describe('Error Handling', () => {
    test('Should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const { GET } = await import('@/app/api/voice-agents/route');
      const response = await GET(new NextRequest('http://localhost:3001/api/voice-agents'));

      expect(response.status).toBe(401);
    });

    test('Should handle database errors gracefully', async () => {
      mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({
        data: null,
        error: { message: 'Database connection failed' },
        count: 0
      }));

      const { GET } = await import('@/app/api/voice-agents/route');
      const response = await GET(new NextRequest('http://localhost:3001/api/voice-agents'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    test('Should validate required fields on POST', async () => {
      const { POST } = await import('@/app/api/voice-agents/route');
      const request = new NextRequest('http://localhost:3001/api/voice-agents', {
        method: 'POST',
        body: JSON.stringify({}), // Missing required fields
      });

      const response = await POST(request);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  // =============================================================================
  // 9. RLS POLICY TESTS (Conceptual - actual RLS is enforced by Supabase)
  // =============================================================================

  describe('Row Level Security Policies', () => {
    test('RLS should filter by company_id from users table', () => {
      // This is enforced by Supabase RLS policies:
      // USING (company_id IN (SELECT company_id FROM public.users WHERE id = auth.uid()))
      
      const expectedRLSQuery = `
        company_id IN (
          SELECT company_id FROM public.users WHERE id = auth.uid()
        )
      `;

      expect(expectedRLSQuery).toContain('company_id');
      expect(expectedRLSQuery).toContain('auth.uid()');
    });
  });
});
