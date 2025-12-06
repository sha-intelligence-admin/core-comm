/**
 * @jest-environment node
 */

import { 
  AuthenticationError, 
  ValidationError, 
  RateLimitError, 
  CSRFError, 
  NotFoundError, 
  DatabaseError,
  createErrorResponse,
  createSuccessResponse 
} from '@/lib/error-handling'

describe('Error Handling', () => {
  describe('Custom Error Classes', () => {
    it('should create AuthenticationError correctly', () => {
      const error = new AuthenticationError('Custom auth message')
      
      expect(error.name).toBe('AuthenticationError')
      expect(error.message).toBe('Custom auth message')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('AUTH_ERROR')
    })

    it('should create ValidationError correctly', () => {
      const error = new ValidationError('Invalid data')
      
      expect(error.name).toBe('ValidationError')
      expect(error.message).toBe('Invalid data')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
    })

    it('should create RateLimitError correctly', () => {
      const error = new RateLimitError()
      
      expect(error.name).toBe('RateLimitError')
      expect(error.message).toBe('Too many requests')
      expect(error.statusCode).toBe(429)
      expect(error.code).toBe('RATE_LIMIT_ERROR')
    })

    it('should create CSRFError correctly', () => {
      const error = new CSRFError()
      
      expect(error.name).toBe('CSRFError')
      expect(error.message).toBe('Invalid request')
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('CSRF_ERROR')
    })

    it('should create NotFoundError correctly', () => {
      const error = new NotFoundError('Resource missing')
      
      expect(error.name).toBe('NotFoundError')
      expect(error.message).toBe('Resource missing')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    })

    it('should create DatabaseError correctly', () => {
      const error = new DatabaseError('Connection failed')
      
      expect(error.name).toBe('DatabaseError')
      expect(error.message).toBe('Connection failed')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('DATABASE_ERROR')
    })
  })

  describe('Error Response Creation', () => {
    it('should handle AuthenticationError', async () => {
      const error = new AuthenticationError('Login required')
      const response = createErrorResponse(error)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
      expect(data.code).toBe('AUTH_ERROR')
      expect(data.errorId).toMatch(/^err_\d+_\w+$/)
    })

    it('should handle ValidationError', async () => {
      const error = new ValidationError('Invalid input')
      const response = createErrorResponse(error)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
      expect(data.code).toBe('VALIDATION_ERROR')
    })

    it('should handle RateLimitError', async () => {
      const error = new RateLimitError()
      const response = createErrorResponse(error)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Too many requests. Please try again later.')
      expect(data.code).toBe('RATE_LIMIT_ERROR')
    })

    it('should handle CSRFError', async () => {
      const error = new CSRFError()
      const response = createErrorResponse(error)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Invalid request. Please refresh and try again.')
      expect(data.code).toBe('CSRF_ERROR')
    })

    it('should handle NotFoundError', async () => {
      const error = new NotFoundError()
      const response = createErrorResponse(error)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Resource not found')
      expect(data.code).toBe('NOT_FOUND')
    })

    it('should handle generic errors', async () => {
      const error = new Error('Generic error')
      const response = createErrorResponse(error)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('An unexpected error occurred. Please try again later.')
      expect(data.errorId).toMatch(/^err_\d+_\w+$/)
      expect(data.code).toBeUndefined()
    })

    it('should handle unknown error types', async () => {
      const error = 'string error'
      const response = createErrorResponse(error)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('An unexpected error occurred. Please try again later.')
    })

    it('should use fallback message when provided', async () => {
      const error = new Error('Generic error')
      const response = createErrorResponse(error, 'Custom fallback')
      const data = await response.json()

      expect(data.error).toBe('An unexpected error occurred. Please try again later.')
    })

    it('should generate unique error IDs', async () => {
      const error1 = new Error('Error 1')
      const error2 = new Error('Error 2')
      
      const response1 = createErrorResponse(error1)
      const response2 = createErrorResponse(error2)
      
      const data1 = await response1.json()
      const data2 = await response2.json()

      expect(data1.errorId).not.toBe(data2.errorId)
    })
  })

  describe('Success Response Creation', () => {
    it('should create success response with data', async () => {
      const testData = { id: 1, name: 'Test' }
      const response = createSuccessResponse(testData)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual(testData)
      expect(data.message).toBeUndefined()
    })

    it('should create success response with data and message', async () => {
      const testData = { id: 1, name: 'Test' }
      const message = 'Operation successful'
      const response = createSuccessResponse(testData, message)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual(testData)
      expect(data.message).toBe(message)
    })

    it('should handle null data', async () => {
      const response = createSuccessResponse(null)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toBeNull()
    })
  })

  describe('Error Logging', () => {
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('should log detailed errors in development', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const error = new Error('Test error')
      createErrorResponse(error)

      expect(consoleSpy).toHaveBeenCalledWith('API Error:', error)

      process.env.NODE_ENV = originalEnv
    })

    it('should log limited errors in production', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const error = new Error('Test error')
      createErrorResponse(error)

      expect(consoleSpy).toHaveBeenCalledWith('API Error occurred:', 'Test error')

      process.env.NODE_ENV = originalEnv
    })

    it('should handle non-Error objects in production logging', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const error = 'string error'
      createErrorResponse(error)

      expect(consoleSpy).toHaveBeenCalledWith('API Error occurred:', 'Unknown error')

      process.env.NODE_ENV = originalEnv
    })
  })
})