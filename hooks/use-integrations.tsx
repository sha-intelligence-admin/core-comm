"use client"

import { useState, useEffect } from 'react'

export interface Integration {
  id: string
  name: string
  type: 'mcp' | 'webhook' | 'api' | 'crm' | 'helpdesk'
  endpoint_url: string
  status: 'active' | 'inactive' | 'error' | 'pending'
  config: Record<string, any>
  description?: string
  last_sync?: string
  error_message?: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface IntegrationsFilters {
  page?: number
  limit?: number
  type?: 'mcp' | 'webhook' | 'api' | 'crm' | 'helpdesk'
  status?: 'active' | 'inactive' | 'error' | 'pending'
  search?: string
}

export interface IntegrationsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<IntegrationsPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchIntegrations = async (filters: IntegrationsFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.type) params.append('type', filters.type)
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/integrations?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch integrations')
      }

      const data = await response.json()
      setIntegrations(data.integrations || [])
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIntegrations([])
    } finally {
      setLoading(false)
    }
  }

  const createIntegration = async (integrationData: Partial<Integration>) => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(integrationData),
      })

      if (!response.ok) {
        throw new Error('Failed to create integration')
      }

      const data = await response.json()
      await fetchIntegrations() // Refresh list
      return { success: true, data }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const updateIntegration = async (id: string, updates: Partial<Integration>) => {
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update integration')
      }

      await fetchIntegrations()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const deleteIntegration = async (id: string) => {
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete integration')
      }

      await fetchIntegrations()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  useEffect(() => {
    fetchIntegrations()
  }, [])

  return {
    integrations,
    loading,
    error,
    pagination,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
  }
}
