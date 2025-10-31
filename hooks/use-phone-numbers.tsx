"use client"

import useSWR from 'swr'
import { useUserProfile } from './use-user-profile'

export interface PhoneNumber {
  id: string
  company_id: string
  vapi_phone_id: string
  phone_number: string
  assistant_id: string | null
  provider: string
  country_code: string
  is_active: boolean
  created_at: string
  updated_at: string
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

export function usePhoneNumbers() {
  const { profile, loading: profileLoading } = useUserProfile()

  const url = profile && !profileLoading ? '/api/vapi/phone-numbers' : null

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const createPhoneNumber = async (phoneData: any) => {
    const res = await fetch('/api/vapi/phone-numbers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phoneData),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to create phone number')
    }

    const result = await res.json()
    await mutate()
    return result.data
  }

  const updatePhoneNumber = async (id: string, updates: Partial<PhoneNumber>) => {
    const res = await fetch(`/api/vapi/phone-numbers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to update phone number')
    }

    const result = await res.json()
    await mutate()
    return result.data
  }

  const deletePhoneNumber = async (id: string) => {
    const res = await fetch(`/api/vapi/phone-numbers/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to delete phone number')
    }

    await mutate()
  }

  return {
    phoneNumbers: data?.phoneNumbers || [],
    isLoading: profileLoading || isLoading,
    error,
    createPhoneNumber,
    updatePhoneNumber,
    deletePhoneNumber,
    refetch: () => mutate(),
  }
}

export function usePhoneNumber(id: string | null) {
  const { profile, loading: profileLoading } = useUserProfile()

  const url = profile && !profileLoading && id ? `/api/vapi/phone-numbers/${id}` : null

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    phoneNumber: data?.phoneNumber as PhoneNumber | null,
    stats: data?.stats || null,
    isLoading: profileLoading || isLoading,
    error,
    refetch: () => mutate(),
  }
}
