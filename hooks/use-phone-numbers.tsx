"use client"

import { useState, useEffect } from 'react'

export type PhoneNumberProvider = 'vapi' | 'twilio' | 'vonage' | 'telnyx' | 'byo'
export type PhoneNumberSource = 'vapi' | 'legacy'

export interface PhoneNumberAssistant {
  id: string
  name: string
  vapi_assistant_id: string
}

export interface PhoneNumber {
  id: string
  phone_number: string
  provider: PhoneNumberProvider
  country_code: string | null
  status: 'active' | 'inactive'
  is_active: boolean
  assistant_id: string | null
  assigned_to?: string | null
  vapi_phone_id: string
  created_at: string
  updated_at: string
  total_inbound_calls: number
  total_outbound_calls: number
  assistant?: PhoneNumberAssistant | null
  source: PhoneNumberSource
}

export type ProvisionPhoneNumberPayload = {
  provider: PhoneNumberProvider
  assistantId?: string
  areaCode?: string
  number?: string
  fallbackNumber?: string
}

export type UpdatePhoneNumberPayload = {
  assistantId?: string | null
  isActive?: boolean
  assigned_to?: string | null
  status?: 'active' | 'inactive'
}

const normalizePhoneNumber = (record: any): PhoneNumber => {
  const assistant = record?.vapi_assistants
    ? {
        id: record.vapi_assistants.id,
        name: record.vapi_assistants.name,
        vapi_assistant_id: record.vapi_assistants.vapi_assistant_id,
      }
    : null

  const source: PhoneNumberSource = record.source === 'legacy' ? 'legacy' : 'vapi'
  const isActive = record.is_active ?? record.status === 'active'

  return {
    id: record.id,
    phone_number: record.phone_number,
    provider: (record.provider || 'twilio') as PhoneNumberProvider,
    country_code: record.country_code || null,
    status: isActive ? 'active' : 'inactive',
    is_active: Boolean(isActive),
    assistant_id: record.assistant_id || null,
    assigned_to: assistant?.name || record.assigned_to || null,
    vapi_phone_id: record.vapi_phone_id || record.id,
    created_at: record.created_at,
    updated_at: record.updated_at,
    total_inbound_calls: record.total_inbound_calls ?? 0,
    total_outbound_calls: record.total_outbound_calls ?? 0,
    assistant,
    source,
  }
}

const extractPhoneNumbers = (payload: any) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (payload.data?.phoneNumbers) return payload.data.phoneNumbers
  if (payload.phoneNumbers) return payload.phoneNumbers
  return []
}

export function usePhoneNumbers() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPhoneNumbers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/vapi/phone-numbers')

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch phone numbers')
      }

      const payload = await response.json()
      const raw = extractPhoneNumbers(payload)
      setPhoneNumbers(raw.map(normalizePhoneNumber))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setPhoneNumbers([])
    } finally {
      setLoading(false)
    }
  }

  const createPhoneNumber = async (payload: ProvisionPhoneNumberPayload) => {
    try {
      const response = await fetch('/api/vapi/phone-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(body.error || 'Failed to provision phone number')
      }

      await fetchPhoneNumbers()
      return { success: true, data: body.data }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const updatePhoneNumber = async (id: string, updates: UpdatePhoneNumberPayload) => {
    try {
      const response = await fetch(`/api/vapi/phone-numbers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(body.error || 'Failed to update phone number')
      }

      await fetchPhoneNumbers()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const deletePhoneNumber = async (id: string) => {
    try {
      const response = await fetch(`/api/vapi/phone-numbers/${id}`, {
        method: 'DELETE',
      })

      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(body.error || 'Failed to delete phone number')
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
    fetchPhoneNumbers,
    createPhoneNumber,
    updatePhoneNumber,
    deletePhoneNumber,
  }
}
