"use client"

import useSWR from 'swr'
import { useUserProfile } from './use-user-profile'

/**
 * Represents a call record.
 */
export interface Call {
  id: string
  company_id: string
  vapi_call_id: string | null
  vapi_assistant_id: string | null
  caller_number: string
  recipient_number: string | null
  duration: number | null
  transcript: string | null
  summary: string | null
  recording_url: string | null
  resolution_status: 'pending' | 'resolved' | 'escalated' | 'failed'
  sentiment: 'positive' | 'neutral' | 'negative' | null
  priority: 'low' | 'medium' | 'high' | 'critical'
  ended_reason: string | null
  call_type: 'inbound' | 'outbound'
  cost_breakdown: any
  created_at: string
  updated_at: string
}

/**
 * Filters for querying calls.
 */
export interface CallsFilters {
  page?: number
  limit?: number
  resolution_status?: string
  call_type?: string
  priority?: string
  search?: string
}

/**
 * Response structure for calls API.
 */
interface CallsResponse {
  calls: Call[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Fetches data from the API.
 * 
 * @param url - The URL to fetch data from
 * @returns The data property from the JSON response
 * @throws Error if the request fails
 */
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to fetch calls')
  }
  const data = await res.json()
  return data.data
}

/**
 * Hook to fetch and manage calls.
 * 
 * @param filters - Optional filters to apply to the query
 * @returns Object containing calls data, loading state, error state, and mutation function
 */
export function useCalls(filters: CallsFilters = {}) {
  const { profile, loading: profileLoading } = useUserProfile()

  // Build query string from filters
  const queryParams = new URLSearchParams()
  if (filters.page) queryParams.set('page', filters.page.toString())
  if (filters.limit) queryParams.set('limit', filters.limit.toString())
  if (filters.resolution_status) queryParams.set('resolution_status', filters.resolution_status)
  if (filters.call_type) queryParams.set('call_type', filters.call_type)
  if (filters.priority) queryParams.set('priority', filters.priority)
  if (filters.search) queryParams.set('search', filters.search)

  const queryString = queryParams.toString()
  const url = profile && !profileLoading ? `/api/calls${queryString ? `?${queryString}` : ''}` : null

  const { data, error, isLoading, mutate } = useSWR<CallsResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  return {
    calls: data?.calls || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading: profileLoading || isLoading,
    error,
    mutate,
    refetch: () => mutate(),
  }
}

export function useCall(id: string | null) {
  const { profile, loading: profileLoading } = useUserProfile()

  const url = profile && !profileLoading && id ? `/api/calls/${id}` : null

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    call: data?.call as Call | null,
    isLoading: profileLoading || isLoading,
    error,
    refetch: () => mutate(),
  }
}
