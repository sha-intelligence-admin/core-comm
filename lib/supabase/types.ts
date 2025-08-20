export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'admin' | 'user'
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'admin' | 'user'
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'admin' | 'user'
          is_active?: boolean
        }
      }
      calls: {
        Row: {
          id: string
          caller_number: string
          recipient_number: string | null
          duration: number
          transcript: string | null
          resolution_status: 'pending' | 'resolved' | 'escalated' | 'failed'
          created_at: string
          updated_at: string
          user_id: string | null
          call_type: 'inbound' | 'outbound'
          summary: string | null
          sentiment: 'positive' | 'neutral' | 'negative' | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
        }
        Insert: {
          id?: string
          caller_number: string
          recipient_number?: string | null
          duration: number
          transcript?: string | null
          resolution_status?: 'pending' | 'resolved' | 'escalated' | 'failed'
          created_at?: string
          updated_at?: string
          user_id?: string | null
          call_type?: 'inbound' | 'outbound'
          summary?: string | null
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
        }
        Update: {
          id?: string
          caller_number?: string
          recipient_number?: string | null
          duration?: number
          transcript?: string | null
          resolution_status?: 'pending' | 'resolved' | 'escalated' | 'failed'
          created_at?: string
          updated_at?: string
          user_id?: string | null
          call_type?: 'inbound' | 'outbound'
          summary?: string | null
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
        }
      }
      integrations: {
        Row: {
          id: string
          name: string
          type: 'mcp' | 'webhook' | 'api' | 'crm' | 'helpdesk'
          endpoint_url: string
          status: 'active' | 'inactive' | 'error' | 'pending'
          config: any
          created_at: string
          updated_at: string
          user_id: string | null
          description: string | null
          last_sync: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          name: string
          type: 'mcp' | 'webhook' | 'api' | 'crm' | 'helpdesk'
          endpoint_url: string
          status?: 'active' | 'inactive' | 'error' | 'pending'
          config?: any
          created_at?: string
          updated_at?: string
          user_id?: string | null
          description?: string | null
          last_sync?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: 'mcp' | 'webhook' | 'api' | 'crm' | 'helpdesk'
          endpoint_url?: string
          status?: 'active' | 'inactive' | 'error' | 'pending'
          config?: any
          created_at?: string
          updated_at?: string
          user_id?: string | null
          description?: string | null
          last_sync?: string | null
          error_message?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
