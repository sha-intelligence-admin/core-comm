import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export interface SessionConfig {
  maxAge: number // in seconds
  idleTimeout: number // in seconds
  renewalThreshold: number // in seconds before expiry to auto-renew
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxAge: 8 * 60 * 60, // 8 hours
  idleTimeout: 2 * 60 * 60, // 2 hours of inactivity
  renewalThreshold: 30 * 60 // Renew if less than 30 minutes left
}

export class SessionManager {
  private config: SessionConfig

  constructor(config: SessionConfig = DEFAULT_SESSION_CONFIG) {
    this.config = config
  }

  async validateSession(request: NextRequest): Promise<{
    valid: boolean
    user: any
    shouldRenew: boolean
    error?: string
  }> {
    try {
      const supabase = await createClient()
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        return {
          valid: false,
          user: null,
          shouldRenew: false,
          error: 'No valid session'
        }
      }

      // Check if session is expired
      const now = Math.floor(Date.now() / 1000)
      const sessionExp = session.expires_at || 0

      if (now >= sessionExp) {
        await this.invalidateSession(supabase)
        return {
          valid: false,
          user: null,
          shouldRenew: false,
          error: 'Session expired'
        }
      }

      // Check idle timeout
      const lastActivity = await this.getLastActivity(session.user.id)
      if (lastActivity && (now - lastActivity) > this.config.idleTimeout) {
        await this.invalidateSession(supabase)
        return {
          valid: false,
          user: null,
          shouldRenew: false,
          error: 'Session idle timeout'
        }
      }

      // Check if session should be renewed
      const timeUntilExpiry = sessionExp - now
      const shouldRenew = timeUntilExpiry < this.config.renewalThreshold

      // Update last activity
      await this.updateLastActivity(session.user.id)

      return {
        valid: true,
        user: session.user,
        shouldRenew
      }
    } catch (error) {
      console.error('Session validation error:', error)
      return {
        valid: false,
        user: null,
        shouldRenew: false,
        error: 'Session validation failed'
      }
    }
  }

  async renewSession(request: NextRequest): Promise<{
    success: boolean
    response?: NextResponse
    error?: string
  }> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error || !data.session) {
        return {
          success: false,
          error: 'Failed to renew session'
        }
      }

      // Update last activity
      await this.updateLastActivity(data.session.user.id)

      return {
        success: true
      }
    } catch (error) {
      console.error('Session renewal error:', error)
      return {
        success: false,
        error: 'Session renewal failed'
      }
    }
  }

  async invalidateSession(supabase: any): Promise<void> {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error invalidating session:', error)
    }
  }

  private async getLastActivity(userId: string): Promise<number | null> {
    try {
      // In production, store this in Redis or database
      // For now, we'll use a simple approach
      const key = `last_activity:${userId}`
      
      // This would be a Redis GET in production
      // return await redis.get(key)
      
      // Fallback: return null to skip idle check
      return null
    } catch (error) {
      console.error('Error getting last activity:', error)
      return null
    }
  }

  private async updateLastActivity(userId: string): Promise<void> {
    try {
      const now = Math.floor(Date.now() / 1000)
      const key = `last_activity:${userId}`
      
      // In production, store this in Redis with TTL
      // await redis.setex(key, this.config.maxAge, now.toString())
      
      // For development, we'll skip this
    } catch (error) {
      console.error('Error updating last activity:', error)
    }
  }

  async getSessionInfo(userId: string): Promise<{
    isActive: boolean
    expiresAt?: number
    lastActivity?: number
    timeUntilExpiry?: number
  }> {
    try {
      const supabase = await createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || session.user.id !== userId) {
        return { isActive: false }
      }

      const now = Math.floor(Date.now() / 1000)
      const expiresAt = session.expires_at || 0
      const lastActivity = await this.getLastActivity(userId)
      
      return {
        isActive: true,
        expiresAt,
        lastActivity: lastActivity || undefined,
        timeUntilExpiry: Math.max(0, expiresAt - now)
      }
    } catch (error) {
      console.error('Error getting session info:', error)
      return { isActive: false }
    }
  }
}

// Default session manager instance
export const sessionManager = new SessionManager()

// Middleware helper
export async function withSessionValidation(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<Response>
): Promise<Response> {
  const validation = await sessionManager.validateSession(request)
  
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error || 'Session invalid' },
      { status: 401 }
    )
  }

  // Auto-renew session if needed
  if (validation.shouldRenew) {
    await sessionManager.renewSession(request)
  }

  return handler(request, validation.user)
}

// Session timeout configuration for Supabase
export function getSupabaseSessionConfig() {
  return {
    accessToken: {
      expiresIn: DEFAULT_SESSION_CONFIG.maxAge
    },
    refreshToken: {
      expiresIn: 7 * 24 * 60 * 60 // 7 days
    }
  }
}