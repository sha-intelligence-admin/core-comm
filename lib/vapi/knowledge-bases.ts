import { getVapiClient } from './client';
import { createServiceRoleClient } from '@/lib/supabase/server';
import type { CreateKnowledgeBaseInput, UpdateKnowledgeBaseInput } from '@/lib/validations';

/**
 * Create a new knowledge base
 * Note: Vapi manages knowledge bases through assistants, not as a separate resource
 * This creates a record in our database for tracking purposes
 */
export async function createKnowledgeBase(
  companyId: string,
  params: CreateKnowledgeBaseInput
) {
  const supabase = createServiceRoleClient();

  // Generate a unique identifier for this knowledge base
  const kbId = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Store in database
  const { data, error } = await supabase
    .from('vapi_knowledge_bases')
    .insert({
      company_id: companyId,
      vapi_kb_id: kbId,
      name: params.name,
      description: params.description || null,
      provider: params.provider || 'google',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating knowledge base:', error);
    throw new Error('Failed to create knowledge base');
  }

  return data;
}

/**
 * List all knowledge bases for a company
 */
export async function listKnowledgeBases(companyId: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('vapi_knowledge_bases')
    .select(`
      *,
      vapi_kb_files (count)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false});

  if (error) {
    console.error('Error listing knowledge bases:', error);
    throw new Error('Failed to list knowledge bases');
  }

  // Transform to include file count
  return data.map((kb: any) => ({
    ...kb,
    fileCount: Array.isArray(kb.vapi_kb_files) ? kb.vapi_kb_files.length : 0,
  }));
}

/**
 * Get a single knowledge base with files
 */
export async function getKnowledgeBase(id: string, companyId: string) {
  const supabase = createServiceRoleClient();

  const { data: kb, error: kbError } = await supabase
    .from('vapi_knowledge_bases')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (kbError || !kb) {
    throw new Error('Knowledge base not found');
  }

  // Get files for this knowledge base
  const { data: files, error: filesError } = await supabase
    .from('vapi_kb_files')
    .select('*')
    .eq('knowledge_base_id', id)
    .order('created_at', { ascending: false });

  if (filesError) {
    console.error('Error fetching files:', filesError);
  }

  return {
    ...kb,
    files: files || [],
  };
}

/**
 * Update a knowledge base
 */
export async function updateKnowledgeBase(
  id: string,
  companyId: string,
  updates: UpdateKnowledgeBaseInput
) {
  const supabase = createServiceRoleClient();

  // Verify knowledge base exists and belongs to company
  const { data: existing, error: fetchError } = await supabase
    .from('vapi_knowledge_bases')
    .select('id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (fetchError || !existing) {
    throw new Error('Knowledge base not found');
  }

  // Update in database
  const { data, error } = await supabase
    .from('vapi_knowledge_bases')
    .update({
      ...(updates.name && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.provider && { provider: updates.provider }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update knowledge base');
  }

  return data;
}

/**
 * Delete a knowledge base and all its files
 */
export async function deleteKnowledgeBase(id: string, companyId: string) {
  const supabase = createServiceRoleClient();

  // Get knowledge base and its files
  const { data: kb, error: kbError } = await supabase
    .from('vapi_knowledge_bases')
    .select(`
      *,
      vapi_kb_files (*)
    `)
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (kbError || !kb) {
    throw new Error('Knowledge base not found');
  }

  const vapi = getVapiClient();

  // Delete all files from Vapi
  if (kb.vapi_kb_files && Array.isArray(kb.vapi_kb_files)) {
    for (const file of kb.vapi_kb_files as any[]) {
      try {
        await vapi.files.delete(file.vapi_file_id);
      } catch (error) {
        console.error(`Error deleting file ${file.vapi_file_id}:`, error);
        // Continue deleting other files
      }
    }
  }

  // Delete from database (cascade will handle files)
  const { error: deleteError } = await supabase
    .from('vapi_knowledge_bases')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId);

  if (deleteError) {
    throw new Error('Failed to delete knowledge base');
  }
}

/**
 * Upload a file to a knowledge base
 */
export async function uploadFile(
  kbId: string,
  companyId: string,
  file: File
) {
  const supabase = createServiceRoleClient();

  // Verify knowledge base exists and belongs to company
  const { data: kb, error: kbError } = await supabase
    .from('vapi_knowledge_bases')
    .select('vapi_kb_id')
    .eq('id', kbId)
    .eq('company_id', companyId)
    .single();

  if (kbError || !kb) {
    throw new Error('Knowledge base not found');
  }

  // Upload to Vapi using the files API
  const vapi = getVapiClient();

  // Convert File to the format expected by Vapi SDK
  const vapiFile = await vapi.files.create({
    file: file as any, // The SDK expects a File object
  });

  // Store file metadata in database
  const { data: fileData, error: fileError } = await supabase
    .from('vapi_kb_files')
    .insert({
      knowledge_base_id: kbId,
      vapi_file_id: vapiFile.id,
      filename: file.name,
      file_size: file.size,
      mime_type: file.type,
      file_url: (vapiFile as any).url || null,
      parsing_status: 'pending',
    })
    .select()
    .single();

  if (fileError) {
    // Cleanup: Delete from Vapi if database insert fails
    try {
      await vapi.files.delete(vapiFile.id);
    } catch (cleanupError) {
      console.error('Error cleaning up Vapi file:', cleanupError);
    }
    throw new Error('Failed to store file metadata');
  }

  return fileData;
}

/**
 * List files in a knowledge base
 */
export async function listFiles(kbId: string, companyId: string) {
  const supabase = createServiceRoleClient();

  // Verify knowledge base belongs to company
  const { data: kb, error: kbError } = await supabase
    .from('vapi_knowledge_bases')
    .select('id')
    .eq('id', kbId)
    .eq('company_id', companyId)
    .single();

  if (kbError || !kb) {
    throw new Error('Knowledge base not found');
  }

  // Get files
  const { data: files, error: filesError } = await supabase
    .from('vapi_kb_files')
    .select('*')
    .eq('knowledge_base_id', kbId)
    .order('created_at', { ascending: false });

  if (filesError) {
    console.error('Error listing files:', filesError);
    throw new Error('Failed to list files');
  }

  return files || [];
}

/**
 * Delete a file from a knowledge base
 */
export async function deleteFile(fileId: string, kbId: string, companyId: string) {
  const supabase = createServiceRoleClient();

  // Get file and verify it belongs to the company's knowledge base
  const { data: file, error: fileError } = await supabase
    .from('vapi_kb_files')
    .select(`
      *,
      vapi_knowledge_bases (
        company_id
      )
    `)
    .eq('id', fileId)
    .eq('knowledge_base_id', kbId)
    .single();

  if (fileError || !file) {
    throw new Error('File not found');
  }

  // Verify company ownership
  const kb = file.vapi_knowledge_bases as any;
  if (kb?.company_id !== companyId) {
    throw new Error('Knowledge base not found');
  }

  // Delete from Vapi
  const vapi = getVapiClient();
  try {
    await vapi.files.delete(file.vapi_file_id);
  } catch (error) {
    console.error('Error deleting file from Vapi:', error);
    // Continue with database deletion
  }

  // Delete from database
  const { error: deleteError } = await supabase
    .from('vapi_kb_files')
    .delete()
    .eq('id', fileId);

  if (deleteError) {
    throw new Error('Failed to delete file');
  }
}

/**
 * Update file parsing status
 * This would typically be called from a webhook when Vapi finishes processing the file
 */
export async function updateFileStatus(
  fileId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  errorMessage?: string
) {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from('vapi_kb_files')
    .update({
      parsing_status: status,
      ...(errorMessage && { error_message: errorMessage }),
    })
    .eq('vapi_file_id', fileId);

  if (error) {
    console.error('Error updating file status:', error);
    throw new Error('Failed to update file status');
  }
}
