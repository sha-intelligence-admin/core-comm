"use client"

import { useState, useEffect } from 'react'

/**
 * Represents a call log entry.
 */
export interface Call {
  id: string
  caller_number: string
  recipient_number?: string
  duration: number
  transcript?: string
  resolution_status: 'pending' | 'resolved' | 'escalated' | 'failed'
  call_type: 'inbound' | 'outbound'
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  user_id: string
}

/**
 * Filters for querying call logs.
 */
export interface CallsFilters {
  page?: number
  limit?: number
  resolution_status?: 'pending' | 'resolved' | 'escalated' | 'failed'
  call_type?: 'inbound' | 'outbound'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  search?: string
}

/**
 * Pagination metadata for call logs.
 */
export interface CallsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Hook to manage call logs with filtering and pagination.
 * 
 * @returns Object containing calls data, loading state, error state, pagination, and fetch function
 */
export function useCallLogs() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<CallsPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  /**
   * Fetches call logs based on provided filters.
   * 
   * @param filters - Optional filters to apply to the query
   */
  const fetchCalls = async (filters: CallsFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.resolution_status) params.append('resolution_status', filters.resolution_status)
      if (filters.call_type) params.append('call_type', filters.call_type)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/calls?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch calls')
      }

      const data = await response.json()
      setCalls(data.calls || [])
      setPagination(data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setCalls([])
    } finally {
      setLoading(false)
    }
  }

  const createCall = async (callData: Partial<Call>) => {
    try {
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callData),
      })

      if (!response.ok) {
        throw new Error('Failed to create call')
      }

      const data = await response.json()
      await fetchCalls() // Refresh list
      return { success: true, data }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const updateCall = async (id: string, updates: Partial<Call>) => {
    try {
      const response = await fetch(`/api/calls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update call')
      }

      await fetchCalls()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const deleteCall = async (id: string) => {
    try {
      const response = await fetch(`/api/calls/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete call')
      }

      await fetchCalls()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  useEffect(() => {
    fetchCalls()
  }, [])

  return {
    calls,
    loading,
    error,
    pagination,
    fetchCalls,
    createCall,
    updateCall,
    deleteCall,
  }
}
