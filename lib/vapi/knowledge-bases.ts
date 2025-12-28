import { getVapiClient } from './client';
import { createServiceRoleClient } from '@/lib/supabase/server';
import type { CreateKnowledgeBaseInput, UpdateKnowledgeBaseInput } from '@/lib/validations';

// Helper to upload file to Vapi
export async function createVapiFile(file: any) {
  const vapi = getVapiClient();
  return vapi.files.create({ file });
}

// Helper to create KB on Vapi
export async function createVapiKnowledgeBase(name: string, fileIds: string[]) {
  const vapi = getVapiClient();
  return (vapi as any).knowledgeBases.create({
    name,
    provider: 'trieve',
    fileIds,
  });
}

// Helper to delete file from Vapi
export async function deleteVapiFile(fileId: string) {
  const vapi = getVapiClient();
  return vapi.files.delete(fileId);
}

// Helper to delete KB from Vapi
export async function deleteVapiKnowledgeBase(kbId: string) {
  const vapi = getVapiClient();
  return (vapi as any).knowledgeBases.delete(kbId);
}

/**
 * Create a new knowledge base
 * Creates a KB on Vapi first, then records it in the database
 */
export async function createKnowledgeBase(
  companyId: string,
  params: CreateKnowledgeBaseInput & { files?: any[] }
) {
  const supabase = createServiceRoleClient();

  // 1. Upload files to Vapi if any
  const fileIds: string[] = [];
  const uploadedFiles: any[] = [];

  if (params.files && params.files.length > 0) {
    for (const file of params.files) {
      try {
        const vapiFile = await createVapiFile(file);
        fileIds.push(vapiFile.id);
        uploadedFiles.push({ ...vapiFile, originalName: file.name });
      } catch (e) {
        console.error('Error uploading file to Vapi:', e);
        // Cleanup already uploaded files
        for (const id of fileIds) {
            try { await deleteVapiFile(id); } catch (err) { console.error('Cleanup error:', err); }
        }
        throw new Error('Failed to upload files to Vapi');
      }
    }
  }

  // 2. Create KB on Vapi
  let vapiKb;
  try {
    // If no files, we still create a KB (empty)
    vapiKb = await createVapiKnowledgeBase(params.name, fileIds);
  } catch (e) {
    console.error('Error creating KB on Vapi:', e);
    // Cleanup files
    for (const id of fileIds) {
      try { await deleteVapiFile(id); } catch (err) { console.error('Cleanup error:', err); }
    }
    throw new Error('Failed to create Knowledge Base on Vapi');
  }

  // 3. Store in database
  const { data: kbData, error: kbError } = await supabase
    .from('vapi_knowledge_bases')
    .insert({
      company_id: companyId,
      vapi_kb_id: vapiKb.id,
      name: params.name,
      description: params.description || null,
      provider: params.provider || 'trieve',
      status: 'synced',
    })
    .select()
    .single();

  if (kbError) {
    console.error('Error creating knowledge base in DB:', kbError);
    // Cleanup Vapi KB
    try { await deleteVapiKnowledgeBase(vapiKb.id); } catch (err) { console.error('Cleanup error:', err); }
    throw new Error('Failed to create knowledge base record');
  }

  // 4. Store files in database
  if (uploadedFiles.length > 0) {
    const fileRecords = uploadedFiles.map(f => ({
      knowledge_base_id: kbData.id,
      vapi_file_id: f.id,
      filename: f.originalName,
      file_size: f.size || 0,
      mime_type: f.mimetype || 'application/octet-stream',
      file_url: f.url || '',
      parsing_status: 'completed',
    }));

    const { error: filesError } = await supabase
      .from('vapi_kb_files')
      .insert(fileRecords);

    if (filesError) {
      console.error('Error storing files in DB:', filesError);
      // We don't rollback the KB creation here, but we log the error.
      // The files exist in Vapi but not in our DB files table.
    }
  }

  return kbData;
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
 * Upload a file to an existing knowledge base
 */
export async function uploadFile(
  kbId: string,
  companyId: string,
  file: any
) {
  const supabase = createServiceRoleClient();

  // 1. Get KB to verify ownership and get vapi_kb_id
  const { data: kb, error: kbError } = await supabase
    .from('vapi_knowledge_bases')
    .select('vapi_kb_id')
    .eq('id', kbId)
    .eq('company_id', companyId)
    .single();

  if (kbError || !kb) {
    throw new Error('Knowledge base not found');
  }

  // 2. Upload file to Vapi
  let vapiFile;
  try {
    vapiFile = await createVapiFile(file);
  } catch (e) {
    console.error('Error uploading file to Vapi:', e);
    throw new Error('Failed to upload file to Vapi');
  }

  // 3. Add file to Vapi KB
  const { data: existingFiles } = await supabase
    .from('vapi_kb_files')
    .select('vapi_file_id')
    .eq('knowledge_base_id', kbId);
    
  const currentFileIds = existingFiles?.map(f => f.vapi_file_id) || [];
  const newFileIds = [...currentFileIds, vapiFile.id];

  const vapi = getVapiClient();
  try {
    await (vapi as any).knowledgeBases.update(kb.vapi_kb_id, {
      fileIds: newFileIds,
    });
  } catch (e) {
    console.error('Error updating KB on Vapi:', e);
    // Cleanup uploaded file
    await deleteVapiFile(vapiFile.id);
    throw new Error('Failed to update Knowledge Base on Vapi');
  }

  // 4. Store file in database
  const { data: fileRecord, error: fileError } = await supabase
    .from('vapi_kb_files')
    .insert({
      knowledge_base_id: kbId,
      vapi_file_id: vapiFile.id,
      filename: file.name,
      file_size: (vapiFile as any).size || file.size,
      mime_type: (vapiFile as any).mimetype || file.type,
      file_url: (vapiFile as any).url || '',
      parsing_status: 'completed',
    })
    .select()
    .single();

  if (fileError) {
    console.error('Error storing file in DB:', fileError);
  }

  return fileRecord;
}

/**
 * Delete a file from a knowledge base
 */
export async function deleteFile(
  kbId: string,
  fileId: string,
  companyId: string
) {
  const supabase = createServiceRoleClient();

  // 1. Get file and KB details
  const { data: fileRecord, error: fetchError } = await supabase
    .from('vapi_kb_files')
    .select('*, vapi_knowledge_bases!inner(company_id, vapi_kb_id)')
    .eq('id', fileId)
    .eq('knowledge_base_id', kbId)
    .single();

  if (fetchError || !fileRecord) {
    throw new Error('File not found');
  }

  if (fileRecord.vapi_knowledge_bases.company_id !== companyId) {
    throw new Error('Unauthorized');
  }

  const vapiKbId = fileRecord.vapi_knowledge_bases.vapi_kb_id;
  const vapiFileId = fileRecord.vapi_file_id;

  // 2. Update Vapi KB to remove file
  const { data: existingFiles } = await supabase
    .from('vapi_kb_files')
    .select('vapi_file_id')
    .eq('knowledge_base_id', kbId)
    .neq('id', fileId);

  const newFileIds = existingFiles?.map(f => f.vapi_file_id) || [];

  const vapi = getVapiClient();
  try {
    await (vapi as any).knowledgeBases.update(vapiKbId, {
      fileIds: newFileIds,
    });
  } catch (e) {
    console.error('Error updating KB on Vapi:', e);
    throw new Error('Failed to update Knowledge Base on Vapi');
  }

  // 3. Delete file from Vapi
  try {
    await deleteVapiFile(vapiFileId);
  } catch (e) {
    console.error('Error deleting file from Vapi:', e);
  }

  // 4. Delete from DB
  const { error: deleteError } = await supabase
    .from('vapi_kb_files')
    .delete()
    .eq('id', fileId);

  if (deleteError) {
    throw new Error('Failed to delete file record');
  }

  return true;
}

/**
 * List files in a knowledge base
 */
export async function listFiles(kbId: string, companyId: string) {
    const supabase = createServiceRoleClient();
    
    // Verify KB ownership
    const { data: kb, error: kbError } = await supabase
        .from('vapi_knowledge_bases')
        .select('id')
        .eq('id', kbId)
        .eq('company_id', companyId)
        .single();

    if (kbError || !kb) {
        throw new Error('Knowledge base not found');
    }

    const { data: files, error } = await supabase
        .from('vapi_kb_files')
        .select('*')
        .eq('knowledge_base_id', kbId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error('Failed to list files');
    }

    return files;
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
