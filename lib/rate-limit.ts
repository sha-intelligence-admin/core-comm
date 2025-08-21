import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// Simple in-memory store (use Redis in production)
const store: RateLimitStore = {}

export interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  maxRequests: number  // Maximum requests per window
}

export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()
    
    // Clean up expired entries
    if (store[key] && now > store[key].resetTime) {
      delete store[key]
    }
    
    // Initialize or increment counter
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + config.windowMs
      }
    } else {
      store[key].count++
    }
    
    // Check if limit exceeded
    if (store[key].count > config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: store[key].resetTime
      }
    }
    
    return {
      success: true,
      remaining: config.maxRequests - store[key].count,
      resetTime: store[key].resetTime
    }
  }
}

// Pre-configured rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 attempts per 15 minutes
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute
})
