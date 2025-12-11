"use client"

import { useState, useEffect } from 'react'

export interface TeamMember {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'manager' | 'agent' | 'viewer' | 'developer'
  department?: string
  status: 'active' | 'inactive' | 'invited' | 'suspended'
  
  phone_number?: string
  avatar_url?: string
  timezone: string
  
  // Permissions
  permissions: Record<string, unknown>
  can_access_analytics: boolean
  can_manage_integrations: boolean
  can_manage_team: boolean
  can_manage_agents: boolean
  can_view_calls: boolean
  can_view_messages: boolean
  can_view_emails: boolean
  
  // Activity
  last_login_at?: string
  last_active_at?: string
  invitation_sent_at?: string
  invitation_accepted_at?: string
  
  // Performance
  total_calls_handled: number
  total_messages_handled: number
  total_emails_handled: number
  avg_response_time: number
  customer_satisfaction_score: number
  
  notes?: string
  config: Record<string, unknown>
  
  created_at: string
  updated_at: string
  user_id: string
}

export interface TeamMembersFilters {
  page?: number
  limit?: number
  status?: 'active' | 'inactive' | 'invited' | 'suspended'
  role?: 'admin' | 'manager' | 'agent' | 'viewer' | 'developer'
  department?: string
  search?: string
}

export interface TeamMembersPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<TeamMembersPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchMembers = async (filters: TeamMembersFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)
      if (filters.role) params.append('role', filters.role)
      if (filters.department) params.append('department', filters.department)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/team-members?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch team members')
      }

      const data = await response.json()
      setMembers(data.members || [])
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const createMember = async (memberData: Partial<TeamMember>) => {
    try {
      const response = await fetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create team member')
      }

      const data = await response.json()
      await fetchMembers() // Refresh list
      return { success: true, data, inviteLink: data.inviteLink, emailSent: data.emailSent }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const resendInvite = async (email: string) => {
    try {
      const response = await fetch('/api/team-members/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to resend invite')
      }

      const data = await response.json()
      return { success: true, inviteLink: data.inviteLink }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const updateMember = async (id: string, updates: Partial<TeamMember>) => {
    try {
      const response = await fetch(`/api/team-members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update team member')
      }

      await fetchMembers()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const deleteMember = async (id: string) => {
    try {
      const response = await fetch(`/api/team-members/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete team member')
      }

      await fetchMembers()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  return {
    members,
    loading,
    error,
    pagination,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    resendInvite,
  }
}
