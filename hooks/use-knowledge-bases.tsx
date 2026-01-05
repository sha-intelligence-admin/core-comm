"use client"

import useSWR from 'swr'
import { useUserProfile } from './use-user-profile'

/**
 * Represents a Vapi knowledge base.
 */
export interface KnowledgeBase {
  id: string
  company_id: string
  vapi_kb_id: string
  name: string
  description: string | null
  provider: string
  created_at: string
  updated_at: string
  fileCount?: number
}

/**
 * Represents a file within a knowledge base.
 */
export interface KBFile {
  id: string
  knowledge_base_id: string
  vapi_file_id: string
  filename: string
  file_size: number
  mime_type: string
  file_url: string | null
  parsing_status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  updated_at: string
}

/**
 * Fetches data from the API with a timeout.
 * 
 * @param url - The URL to fetch data from
 * @returns The data property from the JSON response
 * @throws Error if the request fails or times out
 */
const fetcher = async (url: string) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 15000) // 15s timeout

  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(id)

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Request failed')
    }
    const data = await res.json()
    return data.data
  } catch (error: any) {
    clearTimeout(id)
    if (error.name === 'AbortError') {
      throw new Error('Request timed out')
    }
    throw error
  }
}

/**
 * Hook to manage Vapi knowledge bases.
 * Provides functionality to fetch, create, and manage knowledge bases and their files.
 * 
 * @returns Object containing knowledge bases data, loading state, error state, and mutation functions
 */
export function useKnowledgeBases() {
  const { profile, loading: profileLoading } = useUserProfile()

  const url = profile && !profileLoading ? '/api/vapi/knowledge-bases' : null

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  /**
   * Creates a new knowledge base, optionally with files.
   * 
   * @param kbData - Knowledge base configuration and files
   * @returns The created knowledge base object
   */
  const createKnowledgeBase = async (kbData: any) => {
    let body;
    let headers: Record<string, string> = {};

    if (kbData.files && kbData.files.length > 0) {
      const formData = new FormData();
      formData.append('name', kbData.name);
      if (kbData.description) formData.append('description', kbData.description);
      if (kbData.provider) formData.append('provider', kbData.provider);
      
      kbData.files.forEach((file: File) => {
        formData.append('files', file);
      });
      body = formData;
      // Content-Type header is automatically set by browser with boundary for FormData
    } else {
      body = JSON.stringify(kbData);
      headers = { 'Content-Type': 'application/json' };
    }

    const res = await fetch('/api/vapi/knowledge-bases', {
      method: 'POST',
      headers,
      body,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to create knowledge base')
    }

    const result = await res.json()
    await mutate()
    return result.data
  }

  const updateKnowledgeBase = async (id: string, updates: Partial<KnowledgeBase>) => {
    const res = await fetch(`/api/vapi/knowledge-bases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to update knowledge base')
    }

    const result = await res.json()
    await mutate()
    return result.data
  }

  const deleteKnowledgeBase = async (id: string) => {
    const res = await fetch(`/api/vapi/knowledge-bases/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to delete knowledge base')
    }

    await mutate()
  }

  return {
    knowledgeBases: data?.knowledgeBases || [],
    isLoading: profileLoading || isLoading,
    error,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
    refetch: () => mutate(),
  }
}

export function useKnowledgeBase(id: string | null) {
  const { profile, loading: profileLoading } = useUserProfile()

  const url = profile && !profileLoading && id ? `/api/vapi/knowledge-bases/${id}` : null

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const uploadFile = async (kbId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`/api/vapi/knowledge-bases/${kbId}/files`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to upload file')
    }

    const result = await res.json()
    await mutate()
    return result.data
  }

  const deleteFile = async (kbId: string, fileId: string) => {
    const res = await fetch(`/api/vapi/knowledge-bases/${kbId}/files?fileId=${fileId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to delete file')
    }

    await mutate()
  }

  return {
    knowledgeBase: data?.knowledgeBase as KnowledgeBase | null,
    files: (data?.knowledgeBase?.files || []) as KBFile[],
    isLoading: profileLoading || isLoading,
    error,
    uploadFile,
    deleteFile,
    refetch: () => mutate(),
  }
}
