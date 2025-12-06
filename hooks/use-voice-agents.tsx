"use client"

import { useState, useEffect } from 'react'

export interface VoiceAgent {
  id: string
  name: string
  description?: string
  voice_model: string
  personality?: string
  language: string
  status: 'active' | 'inactive' | 'training' | 'error'
  greeting_message?: string
  knowledge_base_id?: string
  config: Record<string, any>
  total_calls: number
  total_minutes: number
  success_rate: number
  created_at: string
  updated_at: string
  user_id: string
}

export interface VoiceAgentsFilters {
  page?: number
  limit?: number
  status?: 'active' | 'inactive' | 'training' | 'error'
  search?: string
}

export interface VoiceAgentsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function useVoiceAgents() {
  const [agents, setAgents] = useState<VoiceAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<VoiceAgentsPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchAgents = async (filters: VoiceAgentsFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/voice-agents?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch voice agents')
      }

      const data = await response.json()
      setAgents(data.agents || [])
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setAgents([])
    } finally {
      setLoading(false)
    }
  }

  const createAgent = async (agentData: Partial<VoiceAgent>) => {
    try {
      const response = await fetch('/api/voice-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      })

      if (!response.ok) {
        throw new Error('Failed to create voice agent')
      }

      const data = await response.json()
      await fetchAgents() // Refresh list
      return { success: true, data }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const updateAgent = async (id: string, updates: Partial<VoiceAgent>) => {
    try {
      const response = await fetch(`/api/voice-agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update voice agent')
      }

      await fetchAgents()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const deleteAgent = async (id: string) => {
    try {
      const response = await fetch(`/api/voice-agents/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete voice agent')
      }

      await fetchAgents()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  return {
    agents,
    loading,
    error,
    pagination,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
  }
}
