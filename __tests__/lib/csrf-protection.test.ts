/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { CSRFProtection, validateCSRF, generateCSRFToken } from '@/lib/csrf-protection'

describe('CSRF Protection', () => {
  let csrfProtection: CSRFProtection

  beforeEach(() => {
    csrfProtection = new CSRFProtection({
      secret: 'test-secret-key',
      tokenLength: 32,
      cookieName: '__test-csrf-token',
      headerName: 'x-test-csrf-token'
    })
  })

  describe('Token Generation', () => {
    it('should generate token with correct length', () => {
      const token = csrfProtection.generateToken()
      expect(token).toHaveLength(64) // 32 bytes = 64 hex chars
    })

    it('should generate unique tokens', () => {
      const token1 = csrfProtection.generateToken()
      const token2 = csrfProtection.generateToken()
      expect(token1).not.toBe(token2)
    })

    it('should hash tokens consistently', () => {
      const token = 'test-token'
      const hash1 = csrfProtection.hashToken(token)
      const hash2 = csrfProtection.hashToken(token)
      expect(hash1).toBe(hash2)
    })
  })

  describe('Token Verification', () => {
    it('should verify valid tokens', () => {
      const token = 'test-token'
      const hash = csrfProtection.hashToken(token)
      expect(csrfProtection.verifyToken(token, hash)).toBe(true)
    })

    it('should reject invalid tokens', () => {
      const token = 'test-token'
      const wrongHash = csrfProtection.hashToken('wrong-token')
      expect(csrfProtection.verifyToken(token, wrongHash)).toBe(false)
    })
  })

  describe('Request Validation', () => {
    it('should skip protection for GET requests', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'GET'
      })
      
      expect(csrfProtection.shouldSkipProtection(request)).toBe(true)
    })

    it('should skip protection for health checks', () => {
      const request = new NextRequest('http://localhost/api/health', {
        method: 'POST'
      })
      
      expect(csrfProtection.shouldSkipProtection(request)).toBe(true)
    })

    it('should require protection for POST requests', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST'
      })
      
      expect(csrfProtection.shouldSkipProtection(request)).toBe(false)
    })

    it('should validate requests with correct tokens', async () => {
      const { token, hash } = csrfProtection.generateTokenPair()
      
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'x-test-csrf-token': token,
          'cookie': `__test-csrf-token=${hash}`
        }
      })

      await expect(csrfProtection.validateRequest(request)).resolves.not.toThrow()
    })

    it('should reject requests without header token', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'cookie': '__test-csrf-token=some-hash'
        }
      })

      await expect(csrfProtection.validateRequest(request)).rejects.toThrow('CSRF token missing from header')
    })

    it('should reject requests without cookie token', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'x-test-csrf-token': 'some-token'
        }
      })

      await expect(csrfProtection.validateRequest(request)).rejects.toThrow('CSRF token missing from cookie')
    })

    it('should reject requests with mismatched tokens', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'x-test-csrf-token': 'wrong-token',
          'cookie': '__test-csrf-token=wrong-hash'
        }
      })

      await expect(csrfProtection.validateRequest(request)).rejects.toThrow('Invalid CSRF token')
    })
  })

  describe('Cookie Generation', () => {
    it('should create cookie header with correct attributes', () => {
      const hash = 'test-hash'
      const cookieHeader = csrfProtection.createCookieHeader(hash)
      
      expect(cookieHeader).toContain('__test-csrf-token=test-hash')
      expect(cookieHeader).toContain('HttpOnly')
      expect(cookieHeader).toContain('Path=/')
      expect(cookieHeader).toContain('SameSite=strict')
      expect(cookieHeader).toContain('Max-Age=3600')
    })

    it('should include Secure flag in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      const hash = 'test-hash'
      const cookieHeader = csrfProtection.createCookieHeader(hash)
      
      expect(cookieHeader).toContain('Secure')
      
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Global Functions', () => {
    it('should generate token pair with helper function', () => {
      const { token, cookieHeader } = generateCSRFToken()
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(cookieHeader).toBeDefined()
      expect(cookieHeader).toContain('__csrf-token')
    })

    it('should validate CSRF with helper function', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'GET'
      })

      // Should not throw for GET request
      await expect(validateCSRF(request)).resolves.not.toThrow()
    })
  })
})