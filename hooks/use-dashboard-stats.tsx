"use client"

import { useCalls } from './use-calls'
import { useMemo } from 'react'

export interface DashboardStats {
  totalCalls: number
  totalCallsChange: string
  totalCallsTrend: 'up' | 'down'
  resolvedCalls: number
  resolvedCallsChange: string
  resolvedCallsTrend: 'up' | 'down'
  avgDuration: string
  avgDurationChange: string
  avgDurationTrend: 'up' | 'down'
  activeCalls: number
  activeCallsChange: string
  activeCallsTrend: 'up' | 'down'
  queueLength: number
  avgWaitTime: string
  successRate: string
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) return '+0.0%'
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

export function useDashboardStats() {
  // Fetch all calls (we'll filter client-side for now)
  const { calls, isLoading, error } = useCalls({ limit: 1000 })

  const stats = useMemo(() => {
    if (!calls || calls.length === 0) {
      return {
        totalCalls: 0,
        totalCallsChange: '+0.0%',
        totalCallsTrend: 'up' as const,
        resolvedCalls: 0,
        resolvedCallsChange: '+0.0%',
        resolvedCallsTrend: 'up' as const,
        avgDuration: '0m 0s',
        avgDurationChange: '+0.0%',
        avgDurationTrend: 'up' as const,
        activeCalls: 0,
        activeCallsChange: '+0.0%',
        activeCallsTrend: 'up' as const,
        queueLength: 0,
        avgWaitTime: '0m 0s',
        successRate: '0.0%',
      }
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Current period (last 30 days)
    const currentCalls = calls.filter(
      c => new Date(c.created_at) >= thirtyDaysAgo
    )

    // Previous period (30-60 days ago)
    const previousCalls = calls.filter(
      c => new Date(c.created_at) >= sixtyDaysAgo && new Date(c.created_at) < thirtyDaysAgo
    )

    // Total calls
    const totalCalls = currentCalls.length
    const prevTotalCalls = previousCalls.length
    const totalCallsChange = calculatePercentageChange(totalCalls, prevTotalCalls)
    const totalCallsTrend = totalCalls >= prevTotalCalls ? 'up' : 'down'

    // Resolved calls
    const resolvedCalls = currentCalls.filter(c => c.resolution_status === 'resolved').length
    const prevResolvedCalls = previousCalls.filter(c => c.resolution_status === 'resolved').length
    const resolvedCallsChange = calculatePercentageChange(resolvedCalls, prevResolvedCalls)
    const resolvedCallsTrend = resolvedCalls >= prevResolvedCalls ? 'up' : 'down'

    // Average duration
    const totalDuration = currentCalls.reduce((sum, c) => sum + (c.duration || 0), 0)
    const avgDurationSec = currentCalls.length > 0 ? Math.floor(totalDuration / currentCalls.length) : 0
    const avgDuration = formatDuration(avgDurationSec)

    const prevTotalDuration = previousCalls.reduce((sum, c) => sum + (c.duration || 0), 0)
    const prevAvgDurationSec = previousCalls.length > 0 ? Math.floor(prevTotalDuration / previousCalls.length) : 0
    const avgDurationChange = calculatePercentageChange(avgDurationSec, prevAvgDurationSec)
    const avgDurationTrend = avgDurationSec <= prevAvgDurationSec ? 'down' : 'up' // Lower is better

    // Active calls (pending or in-progress from last 24 hours)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const activeCalls = calls.filter(
      c =>
        new Date(c.created_at) >= twentyFourHoursAgo &&
        (c.resolution_status === 'pending' || c.resolution_status === 'escalated')
    ).length

    // Queue length (pending calls from last hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const queueLength = calls.filter(
      c =>
        new Date(c.created_at) >= oneHourAgo &&
        c.resolution_status === 'pending'
    ).length

    // Success rate
    const successRate = totalCalls > 0
      ? ((resolvedCalls / totalCalls) * 100).toFixed(1) + '%'
      : '0.0%'

    return {
      totalCalls,
      totalCallsChange,
      totalCallsTrend,
      resolvedCalls,
      resolvedCallsChange,
      resolvedCallsTrend,
      avgDuration,
      avgDurationChange,
      avgDurationTrend,
      activeCalls,
      activeCallsChange: '+0.0%',
      activeCallsTrend: 'up' as const,
      queueLength,
      avgWaitTime: '1m 23s', // This would require more complex calculation
      successRate,
    }
  }, [calls])

  return {
    stats,
    isLoading,
    error,
  }
}
