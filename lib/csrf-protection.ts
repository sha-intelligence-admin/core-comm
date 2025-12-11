import { NextRequest } from 'next/server'

interface CSRFConfig {
  secret: string
  tokenLength?: number
  cookieName?: string
  headerName?: string
  excludePaths?: string[]
  sameSite?: 'strict' | 'lax' | 'none'
}

class CSRFError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CSRFError'
  }
}

export class CSRFProtection {
  private config: Required<CSRFConfig>

  constructor(config: CSRFConfig) {
    this.config = {
      tokenLength: 32,
      cookieName: '__csrf-token',
      headerName: 'x-csrf-token',
      excludePaths: ['/api/health'],
      sameSite: 'strict',
      ...config
    }
  }

  generateToken(): string {
    const array = new Uint8Array(this.config.tokenLength)
    crypto.getRandomValues(array)
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async hashToken(token: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(token + this.config.secret)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async verifyToken(token: string, expectedHash: string): Promise<boolean> {
    const computedHash = await this.hashToken(token)
    return computedHash === expectedHash
  }

  shouldSkipProtection(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname
    
    // Skip for safe HTTP methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true
    }

    // Skip for excluded paths
    if (this.config.excludePaths.some(path => pathname.startsWith(path))) {
      return true
    }

    // Skip for API health checks
    if (pathname === '/api/health') {
      return true
    }

    return false
  }

  async validateRequest(request: NextRequest): Promise<void> {
    if (this.shouldSkipProtection(request)) {
      return
    }

    // Get token from header
    const headerToken = request.headers.get(this.config.headerName)
    
    // Get token hash from cookie
    const cookieHeader = request.headers.get('cookie')
    const cookies = this.parseCookies(cookieHeader || '')
    const cookieHash = cookies[this.config.cookieName]

    if (!headerToken) {
      throw new CSRFError('CSRF token missing from header')
    }

    if (!cookieHash) {
      throw new CSRFError('CSRF token missing from cookie')
    }

    if (!(await this.verifyToken(headerToken, cookieHash))) {
      throw new CSRFError('Invalid CSRF token')
    }
  }

  async generateTokenPair(): Promise<{ token: string; hash: string }> {
    const token = this.generateToken()
    const hash = await this.hashToken(token)
    return { token, hash }
  }

  createCookieHeader(hash: string): string {
    const secure = process.env.NODE_ENV === 'production'
    const sameSite = this.config.sameSite
    
    return [
      `${this.config.cookieName}=${hash}`,
      'HttpOnly',
      'Path=/',
      ...(secure ? ['Secure'] : []),
      `SameSite=${sameSite}`,
      // Cookie expires in 1 hour
      `Max-Age=3600`
    ].join('; ')
  }

  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {}
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=')
      if (name && rest.length > 0) {
        cookies[name] = rest.join('=')
      }
    })
    
    return cookies
  }
}

// Default CSRF protection instance
export const csrfProtection = new CSRFProtection({
  secret: process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
})

// Middleware helper
export async function validateCSRF(request: NextRequest): Promise<void> {
  try {
    await csrfProtection.validateRequest(request)
  } catch (error) {
    if (error instanceof CSRFError) {
      throw error
    }
    throw new Error('CSRF validation failed')
  }
}

// Helper to generate token for forms
export async function generateCSRFToken(): Promise<{ token: string; cookieHeader: string }> {
  const { token, hash } = await csrfProtection.generateTokenPair()
  const cookieHeader = csrfProtection.createCookieHeader(hash)
  
  return {
    token,
    cookieHeader
  }
}