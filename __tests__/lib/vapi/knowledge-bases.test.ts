import { createKnowledgeBase } from '@/lib/vapi/knowledge-bases';
import { getVapiClient } from '@/lib/vapi/client';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/vapi/client', () => ({
  getVapiClient: jest.fn(),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn(),
}));

describe('Knowledge Base Service', () => {
  let mockVapi: any;
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockVapi = {
      files: {
        create: jest.fn(),
        delete: jest.fn(),
      },
      knowledgeBases: {
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    (getVapiClient as jest.Mock).mockReturnValue(mockVapi);

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('should create KB with files', async () => {
    const companyId = 'comp_123';
    const params = {
      name: 'Test KB',
      description: 'Test Description',
      files: [{ name: 'test.txt' }],
    };

    // Mock Vapi responses
    mockVapi.files.create.mockResolvedValue({ id: 'file_123', name: 'test.txt' });
    mockVapi.knowledgeBases.create.mockResolvedValue({ id: 'kb_123', name: 'Test KB' });

    // Mock Supabase responses
    mockSupabase.single.mockResolvedValue({
      data: { id: 'db_kb_123', vapi_kb_id: 'kb_123' },
      error: null,
    });

    const result = await createKnowledgeBase(companyId, params);

    expect(result).toEqual({ id: 'db_kb_123', vapi_kb_id: 'kb_123' });

    // Verify Vapi calls
    expect(mockVapi.files.create).toHaveBeenCalled();
    expect(mockVapi.knowledgeBases.create).toHaveBeenCalledWith({
      name: 'Test KB',
      provider: 'trieve',
      fileIds: ['file_123'],
    });

    // Verify Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith('vapi_knowledge_bases');
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      company_id: companyId,
      vapi_kb_id: 'kb_123',
      name: 'Test KB',
    }));
    expect(mockSupabase.from).toHaveBeenCalledWith('vapi_kb_files');
  });

  it('should cleanup Vapi resources if DB insert fails', async () => {
    const companyId = 'comp_123';
    const params = {
      name: 'Test KB',
      files: [{ name: 'test.txt' }],
    };

    mockVapi.files.create.mockResolvedValue({ id: 'file_123' });
    mockVapi.knowledgeBases.create.mockResolvedValue({ id: 'kb_123' });

    // Mock DB failure
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { message: 'DB Error' },
    });

    await expect(createKnowledgeBase(companyId, params)).rejects.toThrow('Failed to create knowledge base record');

    // Verify cleanup
    expect(mockVapi.knowledgeBases.delete).toHaveBeenCalledWith('kb_123');
  });
});
