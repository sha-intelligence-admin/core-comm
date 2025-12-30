"use client"

import useSWR from 'swr'
import { useUserProfile } from './use-user-profile'

export interface SecuritySettings {
  id: string
  company_id: string
  two_factor_enabled: boolean
  allowed_auth_methods: string[]
  session_timeout_minutes: number
  ip_whitelist: string[]
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
  return data.data.settings
}

export function useSecuritySettings() {
  const { profile, loading: profileLoading } = useUserProfile()

  const url = profile && !profileLoading ? '/api/security/settings' : null

  const { data: settings, error, isLoading, mutate } = useSWR<SecuritySettings>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const updateSettings = async (updates: Partial<SecuritySettings>) => {
    const res = await fetch('/api/security/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to update settings')
    }

    const result = await res.json()
    await mutate(result.data.settings, false)
    return result.data.settings
  }

  return {
    settings,
    error,
    isLoading: isLoading || profileLoading,
    updateSettings,
    mutate
  }
}
