import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

/**
 * Creates a Supabase client with the Service Role key.
 * WARNING: This client bypasses Row Level Security (RLS).
 * Use only for admin tasks or server-side operations that require elevated privileges.
 * 
 * @returns Supabase client with admin privileges
 * @throws Error if environment variables are missing
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file.'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Common response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Error handling utility
/**
 * Creates a standardized JSON error response.
 * 
 * @param message - Error message to display
 * @param status - HTTP status code (default: 500)
 * @returns Response object with JSON body
 */
export function createErrorResponse(message: string, status = 500): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

// Success response utility
export function createSuccessResponse<T>(data: T, message?: string): Response {
  return new Response(
    JSON.stringify({ data, message }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
