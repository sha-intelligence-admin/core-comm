"use client"

import useSWR from 'swr'
import { useUserProfile } from './use-user-profile'

/**
 * Represents security settings configuration.
 */
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

/**
 * Fetches data from the API.
 * 
 * @param url - The URL to fetch data from
 * @returns The settings property from the JSON response
 * @throws Error if the request fails
 */
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Request failed')
  }
  const data = await res.json()
  return data.data.settings
}

/**
 * Hook to manage security settings.
 * 
 * @returns Object containing settings data, loading state, error state, and update function
 */
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

  /**
   * Updates security settings.
   * 
   * @param updates - Partial settings object to update
   */
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
