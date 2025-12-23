
import { createAssistant } from '@/lib/vapi/assistants';
import { getVapiClient } from '@/lib/vapi/client';
import { createServiceRoleClient } from '@/lib/supabase/api';

// Mock dependencies
jest.mock('@/lib/vapi/client', () => ({
  getVapiClient: jest.fn(),
}));

jest.mock('@/lib/supabase/api', () => ({
  createServiceRoleClient: jest.fn(),
}));

describe('createAssistant', () => {
  const mockVapiCreate = jest.fn();
  const mockVapiDelete = jest.fn();
  const mockSupabaseInsert = jest.fn();
  const mockSupabaseSelect = jest.fn();
  const mockSupabaseSingle = jest.fn();
  const mockSupabaseFrom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Vapi mock
    (getVapiClient as jest.Mock).mockReturnValue({
      assistants: {
        create: mockVapiCreate,
        delete: mockVapiDelete,
      },
    });

    // Setup Supabase mock
    mockSupabaseSingle.mockResolvedValue({ data: { id: 'db-id' }, error: null });
    mockSupabaseSelect.mockReturnValue({ single: mockSupabaseSingle });
    mockSupabaseInsert.mockReturnValue({ select: mockSupabaseSelect });
    mockSupabaseFrom.mockReturnValue({ insert: mockSupabaseInsert });
    (createServiceRoleClient as jest.Mock).mockReturnValue({
      from: mockSupabaseFrom,
    });
  });

  it('should create an assistant with correct language configuration', async () => {
    const companyId = 'company-123';
    const params = {
      name: 'Test Assistant',
      systemPrompt: 'System prompt',
      firstMessage: 'Hello',
      language: 'es' as const,
      model: {
        provider: 'openai' as const,
        model: 'gpt-4',
        temperature: 0.7,
      },
      voice: {
        provider: 'deepgram' as const,
        voiceId: 'voice-123',
      },
    };

    mockVapiCreate.mockResolvedValue({ id: 'vapi-id' });

    await createAssistant(companyId, params);

    // Verify Vapi creation call
    expect(mockVapiCreate).toHaveBeenCalledWith(expect.objectContaining({
      name: params.name,
      transcriber: expect.objectContaining({
        language: 'es',
      }),
      model: expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('IMPORTANT: You must converse in Spanish.'),
          }),
        ]),
      }),
    }));

    // Verify DB insertion
    expect(mockSupabaseFrom).toHaveBeenCalledWith('vapi_assistants');
    expect(mockSupabaseInsert).toHaveBeenCalledWith(expect.objectContaining({
      company_id: companyId,
      vapi_assistant_id: 'vapi-id',
      model_config: expect.objectContaining({
        language: 'es',
      }),
    }));
  });

  it('should default to English if no language provided', async () => {
    const companyId = 'company-123';
    const params = {
      name: 'Test Assistant',
      systemPrompt: 'System prompt',
      firstMessage: 'Hello',
      model: {
        provider: 'openai' as const,
        model: 'gpt-4',
        temperature: 0.7,
      },
      voice: {
        provider: 'deepgram' as const,
        voiceId: 'voice-123',
      },
    };

    mockVapiCreate.mockResolvedValue({ id: 'vapi-id' });

    await createAssistant(companyId, params);

    // Verify Vapi creation call defaults
    expect(mockVapiCreate).toHaveBeenCalledWith(expect.objectContaining({
      transcriber: expect.objectContaining({
        language: 'en',
      }),
    }));
  });
});
