import { NextRequest } from 'next/server'
import Redis from 'ioredis'

// Redis client for production (fallback to in-memory for development)
let redisClient: Redis | null = null

const initRedis = async () => {
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
    if (!redisClient) {
      redisClient = new Redis(process.env.REDIS_URL)
      await redisClient.ping()
      console.log('Connected to Redis for rate limiting')
    }
    return redisClient
  }
  return null
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// Fallback in-memory store for development
const memoryStore: RateLimitStore = {}

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: NextRequest) => string
  skipIf?: (request: NextRequest) => boolean
  message?: string
}

export function createRateLimit(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    // Skip rate limiting if condition is met
    if (config.skipIf && config.skipIf(request)) {
      return {
        success: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs
      }
    }

    // Generate rate limit key
    const key = config.keyGenerator 
      ? config.keyGenerator(request)
      : getDefaultKey(request)

    const now = Date.now()
    const redis = await initRedis().catch(() => null)

    if (redis) {
      return await handleRedisRateLimit(redis, key, config, now)
    } else {
      return handleMemoryRateLimit(key, config, now)
    }
  }
}

function getDefaultKey(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.headers.get('cf-connecting-ip') ||
             'unknown'
  
  return `${ip.split(',')[0].trim()}:${request.nextUrl.pathname}`
}

async function handleRedisRateLimit(
  redis: Redis, 
  key: string, 
  config: RateLimitConfig, 
  now: number
) {
  const multi = redis.multi()
  
  // Use Redis pipeline for atomic operations
  multi.incr(key)
  multi.expire(key, Math.ceil(config.windowMs / 1000))
  
  const results = await multi.exec()
  
  if (!results) {
    throw new Error('Redis rate limit operation failed')
  }

  const count = results[0][1] as number
  const resetTime = now + config.windowMs

  if (count > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime,
      message: config.message || 'Too many requests'
    }
  }

  return {
    success: true,
    remaining: config.maxRequests - count,
    resetTime
  }
}

function handleMemoryRateLimit(
  key: string, 
  config: RateLimitConfig, 
  now: number
) {
  // Clean up expired entries
  if (memoryStore[key] && now > memoryStore[key].resetTime) {
    delete memoryStore[key]
  }

  // Initialize or increment counter
  if (!memoryStore[key]) {
    memoryStore[key] = {
      count: 1,
      resetTime: now + config.windowMs
    }
  } else {
    memoryStore[key].count++
  }

  // Check if limit exceeded
  if (memoryStore[key].count > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: memoryStore[key].resetTime,
      message: config.message || 'Too many requests'
    }
  }

  return {
    success: true,
    remaining: config.maxRequests - memoryStore[key].count,
    resetTime: memoryStore[key].resetTime
  }
}

// Predefined rate limiters with different strategies
export const strictAuthRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  keyGenerator: (request) => {
    const ip = getDefaultKey(request)
    return `auth:${ip}`
  }
})

export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Rate limit exceeded. Please slow down your requests.'
})

export const premiumApiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 500, // Higher limit for premium users
  skipIf: (request) => {
    // Skip for premium users (implement your premium user detection logic)
    const isPremium = request.headers.get('x-user-tier') === 'premium'
    return isPremium
  }
})

export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // Stricter for file uploads
  message: 'Upload rate limit exceeded. Please wait before uploading again.'
})

// Cleanup function for graceful shutdown
export const cleanupRateLimit = async () => {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
  // Clear memory store
  Object.keys(memoryStore).forEach(key => delete memoryStore[key])
}