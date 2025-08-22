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

export class CSRFError extends Error {
  statusCode = 403
  code = 'CSRF_ERROR'
  
  constructor(message = 'Invalid request') {
    super(message)
    this.name = 'CSRFError'
  }
}

export class NotFoundError extends Error {
  statusCode = 404
  code = 'NOT_FOUND'
  
  constructor(message = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends Error {
  statusCode = 500
  code = 'DATABASE_ERROR'
  
  constructor(message = 'Database operation failed') {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Generic error responses that don't expose internal details
export function createErrorResponse(error: unknown, fallbackMessage = 'An error occurred'): Response {
  // Log detailed error for debugging (only in development or with proper logging service)
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error)
  } else {
    // In production, log to your monitoring service (Sentry, etc.)
    console.error('API Error occurred:', error instanceof Error ? error.message : 'Unknown error')
  }
  
  // Generate error ID for tracking
  const errorId = generateErrorId()
  
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { 
        error: 'Authentication required',
        errorId,
        code: error.code 
      },
      { status: 401 }
    )
  }
  
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { 
        error: 'Invalid request data',
        errorId,
        code: error.code 
      },
      { status: 400 }
    )
  }
  
  if (error instanceof RateLimitError) {
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        errorId,
        code: error.code
      },
      { status: 429 }
    )
  }
  
  if (error instanceof CSRFError) {
    return NextResponse.json(
      { 
        error: 'Invalid request. Please refresh and try again.',
        errorId,
        code: error.code
      },
      { status: 403 }
    )
  }
  
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { 
        error: 'Resource not found',
        errorId,
        code: error.code
      },
      { status: 404 }
    )
  }
  
  // Generic error response - never expose internal errors
  return NextResponse.json(
    { 
      error: 'An unexpected error occurred. Please try again later.',
      errorId
    },
    { status: 500 }
  )
}

function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function createSuccessResponse<T>(data: T, message?: string): Response {
  return NextResponse.json({ data, message }, { status: 200 })
}
