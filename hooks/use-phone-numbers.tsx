"use client"

import { useState, useEffect } from 'react'

export interface PhoneNumber {
  id: string
  phone_number: string
  country_code: string
  provider: string
  number_type: 'voice' | 'sms' | 'both'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  friendly_name?: string
  capabilities: {
    voice: boolean
    sms: boolean
    mms: boolean
  }
  assigned_to?: string | null
  monthly_cost: number
  total_inbound_calls: number
  total_outbound_calls: number
  total_sms_sent: number
  total_sms_received: number
  config: Record<string, unknown>
  created_at: string
  updated_at: string
  user_id: string
}

export interface PhoneNumbersFilters {
  page?: number
  limit?: number
  status?: 'active' | 'inactive' | 'suspended' | 'pending'
  provider?: string
  search?: string
}

export interface PhoneNumbersPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function usePhoneNumbers() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PhoneNumbersPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchPhoneNumbers = async (filters: PhoneNumbersFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)
      if (filters.provider) params.append('provider', filters.provider)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/phone-numbers?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch phone numbers')
      }

      const data = await response.json()
      setPhoneNumbers(data.phoneNumbers || [])
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setPhoneNumbers([])
    } finally {
      setLoading(false)
    }
  }

  const createPhoneNumber = async (phoneNumberData: Partial<PhoneNumber>) => {
    try {
      const response = await fetch('/api/phone-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phoneNumberData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create phone number')
      }

      const data = await response.json()
      await fetchPhoneNumbers() // Refresh list
      return { success: true, data }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const updatePhoneNumber = async (id: string, updates: Partial<PhoneNumber>) => {
    try {
      const response = await fetch(`/api/phone-numbers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update phone number')
      }

      await fetchPhoneNumbers()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const deletePhoneNumber = async (id: string) => {
    try {
      const response = await fetch(`/api/phone-numbers/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete phone number')
      }

      await fetchPhoneNumbers()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  useEffect(() => {
    fetchPhoneNumbers()
  }, [])

  return {
    phoneNumbers,
    loading,
    error,
    pagination,
    fetchPhoneNumbers,
    createPhoneNumber,
    updatePhoneNumber,
    deletePhoneNumber,
  }
}
