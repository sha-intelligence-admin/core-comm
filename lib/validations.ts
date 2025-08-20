import { z } from 'zod'

// Call validation schemas
export const CreateCallSchema = z.object({
  caller_number: z.string().min(1, 'Caller number is required'),
  recipient_number: z.string().optional(),
  duration: z.number().int().min(0, 'Duration must be a positive integer'),
  transcript: z.string().optional(),
  resolution_status: z.enum(['pending', 'resolved', 'escalated', 'failed']).default('pending'),
  call_type: z.enum(['inbound', 'outbound']).default('inbound'),
  summary: z.string().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  user_id: z.string().uuid().optional(),
})

export const UpdateCallSchema = CreateCallSchema.partial()

// Integration validation schemas
export const CreateIntegrationSchema = z.object({
  name: z.string().min(1, 'Integration name is required'),
  type: z.enum(['mcp', 'webhook', 'api', 'crm', 'helpdesk']),
  endpoint_url: z.string().url('Must be a valid URL'),
  status: z.enum(['active', 'inactive', 'error', 'pending']).default('pending'),
  config: z.record(z.string(), z.any()).default({}),
  description: z.string().optional(),
  user_id: z.string().uuid().optional(),
})

export const UpdateIntegrationSchema = CreateIntegrationSchema.partial()

// User validation schemas
export const UpdateUserSchema = z.object({
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
  is_active: z.boolean().optional(),
})

// Query parameter schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
})

export const CallsQuerySchema = PaginationSchema.extend({
  resolution_status: z.enum(['pending', 'resolved', 'escalated', 'failed']).optional(),
  call_type: z.enum(['inbound', 'outbound']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  search: z.string().optional(),
})

export const IntegrationsQuerySchema = PaginationSchema.extend({
  type: z.enum(['mcp', 'webhook', 'api', 'crm', 'helpdesk']).optional(),
  status: z.enum(['active', 'inactive', 'error', 'pending']).optional(),
  search: z.string().optional(),
})

// Type exports
export type CreateCallInput = z.infer<typeof CreateCallSchema>
export type UpdateCallInput = z.infer<typeof UpdateCallSchema>
export type CreateIntegrationInput = z.infer<typeof CreateIntegrationSchema>
export type UpdateIntegrationInput = z.infer<typeof UpdateIntegrationSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type CallsQueryInput = z.infer<typeof CallsQuerySchema>
export type IntegrationsQueryInput = z.infer<typeof IntegrationsQuerySchema>
