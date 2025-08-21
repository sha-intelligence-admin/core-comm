import { NextResponse } from 'next/server'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
}

export class AuthenticationError extends Error {
  statusCode = 401
  code = 'AUTH_ERROR'
  
  constructor(message = 'Authentication failed') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class ValidationError extends Error {
  statusCode = 400
  code = 'VALIDATION_ERROR'
  
  constructor(message = 'Invalid input provided') {
    super(message)
    this.name = 'ValidationError'
  }
}

export class RateLimitError extends Error {
  statusCode = 429
  code = 'RATE_LIMIT_ERROR'
  
  constructor(message = 'Too many requests') {
    super(message)
    this.name = 'RateLimitError'
  }
}

// Generic error responses that don't expose internal details
export function createErrorResponse(error: unknown, fallbackMessage = 'An error occurred'): Response {
  console.error('API Error:', error)
  
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
  
  if (error instanceof RateLimitError) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }
  
  // Generic error response
  return NextResponse.json(
    { error: fallbackMessage },
    { status: 500 }
  )
}

export function createSuccessResponse<T>(data: T, message?: string): Response {
  return NextResponse.json({ data, message }, { status: 200 })
}
