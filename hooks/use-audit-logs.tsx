"use client"

import useSWR from 'swr'
import { useUserProfile } from './use-user-profile'

export interface AuditLog {
  id: string
  company_id: string
  user_id: string
  actor_name: string
  action: string
  resource: string | null
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

interface AuditLogsResponse {
  logs: AuditLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Request failed')
  }
  const data = await res.json()
  return data.data
}

export function useAuditLogs(page = 1, limit = 20) {
  const { profile, loading: profileLoading } = useUserProfile()

  const url = profile && !profileLoading 
    ? `/api/security/audit-logs?page=${page}&limit=${limit}` 
    : null

  const { data, error, isLoading, mutate } = useSWR<AuditLogsResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,
    }
  )

  return {
    logs: data?.logs || [],
    pagination: data?.pagination,
    error,
    isLoading: isLoading || profileLoading,
    mutate
  }
}
