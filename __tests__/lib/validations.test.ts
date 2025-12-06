import {
  SignupSchema,
  CreateCallSchema,
  CreateIntegrationSchema,
  CallsQuerySchema
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('SignupSchema', () => {
    it('should validate correct signup data', () => {
      const validData = {
        email: 'test@example.com',
        full_name: 'John Doe',
        phone: '+1234567890',
        password: 'SecurePass123!'
      }

      const result = SignupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        full_name: 'John Doe',
        password: 'SecurePass123!'
      }

      const result = SignupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain('email')
    })

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        full_name: 'John Doe',
        password: '123456' // Too weak
      }

      const result = SignupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues.length).toBeGreaterThan(0)
    })

    it('should accept strong password', () => {
      const validData = {
        email: 'test@example.com',
        full_name: 'John Doe',
        password: 'MySecure123!'
      }

      const result = SignupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('CreateCallSchema', () => {
    it('should validate correct call data', () => {
      const validData = {
        caller_number: '+1234567890',
        duration: 300,
        transcript: 'Hello, this is a test call.',
        resolution_status: 'pending',
        call_type: 'inbound',
        priority: 'medium'
      }

      const result = CreateCallSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid duration', () => {
      const invalidData = {
        caller_number: '+1234567890',
        duration: -100 // Negative duration
      }

      const result = CreateCallSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain('positive')
    })

    it('should use default values', () => {
      const minimalData = {
        caller_number: '+1234567890',
        duration: 300
      }

      const result = CreateCallSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
      expect(result.data?.resolution_status).toBe('pending')
      expect(result.data?.call_type).toBe('inbound')
      expect(result.data?.priority).toBe('medium')
    })
  })

  describe('CreateIntegrationSchema', () => {
    it('should validate correct integration data', () => {
      const validData = {
        name: 'Slack Integration',
        type: 'webhook',
        endpoint_url: 'https://hooks.slack.com/services/xxx',
        description: 'Send notifications to Slack'
      }

      const result = CreateIntegrationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL', () => {
      const invalidData = {
        name: 'Bad Integration',
        type: 'webhook',
        endpoint_url: 'not-a-url'
      }

      const result = CreateIntegrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain('URL')
    })
  })

  describe('CallsQuerySchema', () => {
    it('should validate and coerce query parameters', () => {
      const queryParams = {
        page: '2',
        limit: '20',
        resolution_status: 'resolved',
        search: 'urgent call'
      }

      const result = CallsQuerySchema.safeParse(queryParams)
      expect(result.success).toBe(true)
      expect(result.data?.page).toBe(2) // Should be coerced to number
      expect(result.data?.limit).toBe(20)
    })

    it('should use default values for pagination', () => {
      const emptyParams = {}

      const result = CallsQuerySchema.safeParse(emptyParams)
      expect(result.success).toBe(true)
      expect(result.data?.page).toBe(1)
      expect(result.data?.limit).toBe(10)
    })
  })
})