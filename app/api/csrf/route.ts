import { NextRequest, NextResponse } from 'next/server'
import { generateCSRFToken } from '@/lib/csrf-protection'

export async function GET(request: NextRequest) {
  try {
    const { token, cookieHeader } = generateCSRFToken()
    
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