"use client"

import { useState, useEffect } from 'react'

/**
 * Represents an email account configuration.
 */
export interface EmailAccount {
  id: string
  account_name: string
  email_address: string
  provider: 'gmail' | 'outlook' | 'exchange' | 'imap' | 'smtp' | 'other'
  status: 'active' | 'inactive' | 'suspended' | 'error' | 'pending'
  
  // SMTP Configuration
  smtp_host?: string
  smtp_port?: number
  smtp_username?: string
  smtp_password?: string
  smtp_use_tls?: boolean
  
  // IMAP Configuration
  imap_host?: string
  imap_port?: number
  imap_username?: string
  imap_password?: string
  imap_use_tls?: boolean
  
  // OAuth Configuration
  oauth_provider?: string
  oauth_access_token?: string
  oauth_refresh_token?: string
  oauth_token_expiry?: string
  
  // Additional settings
  signature?: string
  auto_reply_enabled?: boolean
  auto_reply_message?: string
  forward_to_email?: string
  config: Record<string, unknown>
  
  // Metrics
  total_emails_sent: number
  total_emails_received: number
  total_emails_replied: number
  avg_response_time: number
  last_sync_at?: string
  
  created_at: string
  updated_at: string
  user_id: string
}

/**
 * Filters for querying email accounts.
 */
export interface EmailAccountsFilters {
  page?: number
  limit?: number
  status?: 'active' | 'inactive' | 'suspended' | 'error' | 'pending'
  provider?: 'gmail' | 'outlook' | 'exchange' | 'imap' | 'smtp' | 'other'
  search?: string
}

/**
 * Pagination metadata for email accounts.
 */
export interface EmailAccountsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Hook to manage email accounts.
 * 
 * @returns Object containing accounts data, loading state, error state, pagination, and fetch function
 */
export function useEmailAccounts() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<EmailAccountsPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  /**
   * Fetches email accounts based on provided filters.
   * 
   * @param filters - Optional filters to apply to the query
   */
  const fetchAccounts = async (filters: EmailAccountsFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)
      if (filters.provider) params.append('provider', filters.provider)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/email-accounts?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch email accounts')
      }

      const data = await response.json()
      setAccounts(data.accounts || [])
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const createAccount = async (accountData: Partial<EmailAccount>) => {
    try {
      const response = await fetch('/api/email-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create email account')
      }

      const data = await response.json()
      await fetchAccounts() // Refresh list
      return { success: true, data }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const updateAccount = async (id: string, updates: Partial<EmailAccount>) => {
    try {
      const response = await fetch(`/api/email-accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update email account')
      }

      await fetchAccounts()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const deleteAccount = async (id: string) => {
    try {
      const response = await fetch(`/api/email-accounts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete email account')
      }

      await fetchAccounts()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  return {
    accounts,
    loading,
    error,
    pagination,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  }
}
