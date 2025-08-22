/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/csrf/route'

describe('/api/csrf', () => {
  it('should generate CSRF token', async () => {
    const request = new NextRequest('http://localhost/api/csrf', {
      method: 'GET'
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.token).toBeDefined()
    expect(typeof data.token).toBe('string')
    expect(data.token.length).toBeGreaterThan(10)
    expect(data.message).toBe('CSRF token generated successfully')
    
    // Check that Set-Cookie header is present
    const setCookieHeader = response.headers.get('Set-Cookie')
    expect(setCookieHeader).toBeDefined()
    expect(setCookieHeader).toContain('__csrf-token')
    expect(setCookieHeader).toContain('HttpOnly')
    expect(setCookieHeader).toContain('SameSite=strict')
  })

  it('should set secure cookie in production', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const request = new NextRequest('http://localhost/api/csrf', {
      method: 'GET'
    })

    const response = await GET(request)
    const setCookieHeader = response.headers.get('Set-Cookie')
    
    expect(setCookieHeader).toContain('Secure')
    
    // Restore environment
    process.env.NODE_ENV = originalEnv
  })

  it('should generate different tokens on multiple calls', async () => {
    const request1 = new NextRequest('http://localhost/api/csrf', {
      method: 'GET'
    })
    const request2 = new NextRequest('http://localhost/api/csrf', {
      method: 'GET'
    })

    const response1 = await GET(request1)
    const response2 = await GET(request2)
    
    const data1 = await response1.json()
    const data2 = await response2.json()

    expect(data1.token).not.toBe(data2.token)
  })
})