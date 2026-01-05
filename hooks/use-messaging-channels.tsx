"use client"

import { useState, useEffect } from 'react'

/**
 * Represents a messaging channel configuration.
 */
export interface MessagingChannel {
  id: string
  channel_name: string
  channel_type: 'whatsapp' | 'telegram' | 'messenger' | 'slack' | 'discord' | 'sms' | 'webchat'
  provider: string
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'error'
  phone_number?: string
  api_key?: string
  webhook_url?: string
  config: Record<string, unknown>
  total_messages_sent: number
  total_messages_received: number
  total_conversations: number
  response_rate: number
  avg_response_time: number
  created_at: string
  updated_at: string
  user_id: string
}

/**
 * Filters for querying messaging channels.
 */
export interface MessagingChannelsFilters {
  page?: number
  limit?: number
  status?: 'active' | 'inactive' | 'suspended' | 'pending' | 'error'
  channel_type?: 'whatsapp' | 'telegram' | 'messenger' | 'slack' | 'discord' | 'sms' | 'webchat'
  search?: string
}

/**
 * Pagination metadata for messaging channels.
 */
export interface MessagingChannelsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Hook to manage messaging channels.
 * 
 * @returns Object containing channels data, loading state, error state, pagination, and fetch function
 */
export function useMessagingChannels() {
  const [channels, setChannels] = useState<MessagingChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<MessagingChannelsPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchChannels = async (filters: MessagingChannelsFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)
      if (filters.channel_type) params.append('channel_type', filters.channel_type)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/messaging-channels?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch messaging channels')
      }

      const data = await response.json()
      setChannels(data.channels || [])
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setChannels([])
    } finally {
      setLoading(false)
    }
  }

  const createChannel = async (channelData: Partial<MessagingChannel>) => {
    try {
      const response = await fetch('/api/messaging-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channelData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create messaging channel')
      }

      const data = await response.json()
      await fetchChannels() // Refresh list
      return { success: true, data }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const updateChannel = async (id: string, updates: Partial<MessagingChannel>) => {
    try {
      const response = await fetch(`/api/messaging-channels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update messaging channel')
      }

      await fetchChannels()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const deleteChannel = async (id: string) => {
    try {
      const response = await fetch(`/api/messaging-channels/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete messaging channel')
      }

      await fetchChannels()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  useEffect(() => {
    fetchChannels()
  }, [])

  return {
    channels,
    loading,
    error,
    pagination,
    fetchChannels,
    createChannel,
    updateChannel,
    deleteChannel,
  }
}
