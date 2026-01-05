"use client"

import useSWR from 'swr'
import { useUserProfile } from './use-user-profile'
import { useState } from 'react'

/**
 * Represents a Vapi assistant configuration.
 */
export interface Assistant {
  id: string
  company_id: string
  vapi_assistant_id: string
  name: string
  description: string | null
  system_prompt: string
  first_message: string
  model_config: any
  voice_config: any
  is_active: boolean
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
 * Hook to manage Vapi assistants.
 * Provides functionality to fetch, create, update, and delete assistants.
 * 
 * @returns Object containing assistants data, loading state, error state, and mutation functions
 */
export function useAssistants() {
  const { profile, loading: profileLoading } = useUserProfile()

  const url = profile && !profileLoading ? '/api/vapi/assistants' : null

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const createAssistant = async (assistantData: any) => {
    const res = await fetch('/api/vapi/assistants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assistantData),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to create assistant')
    }

    const result = await res.json()
    await mutate()
    return result.data
  }

  const updateAssistant = async (id: string, updates: Partial<Assistant>) => {
    const res = await fetch(`/api/vapi/assistants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to update assistant')
    }

    const result = await res.json()
    await mutate()
    return result.data
  }

  const deleteAssistant = async (id: string) => {
    const res = await fetch(`/api/vapi/assistants/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to delete assistant')
    }

    await mutate()
  }

  return {
    assistants: data?.assistants || [],
    isLoading: profileLoading || isLoading,
    error,
    createAssistant,
    updateAssistant,
    deleteAssistant,
    refetch: () => mutate(),
  }
}

export function useAssistant(id: string | null) {
  const { profile, loading: profileLoading } = useUserProfile()

  const url = profile && !profileLoading && id ? `/api/vapi/assistants/${id}` : null

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    assistant: data?.assistant as Assistant | null,
    stats: data?.stats || null,
    isLoading: profileLoading || isLoading,
    error,
    refetch: () => mutate(),
  }
}
