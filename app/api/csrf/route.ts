import { NextRequest, NextResponse } from 'next/server'
import { generateCSRFToken } from '@/lib/csrf-protection'

/**
 * GET /api/csrf
 * Generates a new CSRF token and sets it as a cookie.
 * 
 * @param request - NextRequest object
 * @returns JSON response with the CSRF token
 */
export async function GET(request: NextRequest) {
  try {
    const { token, cookieHeader } = await generateCSRFToken()
    
    const response = NextResponse.json({
      token,
      message: 'CSRF token generated successfully'
    })
    
    // Set the CSRF cookie
    response.headers.set('Set-Cookie', cookieHeader)
    
    return response
  } catch (error) {
    console.error('CSRF token generation failed:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}