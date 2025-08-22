/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { createRateLimit } from '@/lib/rate-limit-redis'

// Mock Redis
jest.mock('redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    ping: jest.fn().mockResolvedValue('PONG'),
    multi: jest.fn().mockReturnValue({
      incr: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([[null, 1], [null, 'OK']])
    })
  }))
}))

describe('Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment for each test
    delete process.env.REDIS_URL
  })

  it('should allow requests under the limit', async () => {
    const rateLimit = createRateLimit({
      windowMs: 60000,
      maxRequests: 5
    })

    const mockRequest = new NextRequest('http://localhost/api/test', {
      method: 'GET',
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })

    const result = await rateLimit(mockRequest)

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('should block requests over the limit', async () => {
    const rateLimit = createRateLimit({
      windowMs: 60000,
      maxRequests: 2
    })

    const mockRequest = new NextRequest('http://localhost/api/test', {
      method: 'GET',
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })

    // First two requests should pass
    await rateLimit(mockRequest)
    await rateLimit(mockRequest)
    
    // Third request should be blocked
    const result = await rateLimit(mockRequest)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should use custom key generator', async () => {
    const rateLimit = createRateLimit({
      windowMs: 60000,
      maxRequests: 5,
      keyGenerator: (request) => `custom:${request.nextUrl.pathname}`
    })

    const mockRequest = new NextRequest('http://localhost/api/test', {
      method: 'GET'
    })

    const result = await rateLimit(mockRequest)
    expect(result.success).toBe(true)
  })

  it('should skip rate limiting when condition is met', async () => {
    const rateLimit = createRateLimit({
      windowMs: 60000,
      maxRequests: 1,
      skipIf: (request) => request.headers.get('x-skip-ratelimit') === 'true'
    })

    const mockRequest = new NextRequest('http://localhost/api/test', {
      method: 'GET',
      headers: { 'x-skip-ratelimit': 'true' }
    })

    const result = await rateLimit(mockRequest)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(1) // Should return max requests since it was skipped
  })
})