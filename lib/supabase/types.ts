export interface Database {
  public: {
    Tables: {
      company: {
        Row: {
          id: string
          name: string
          company_size: 'small' | 'medium' | 'large'
          member_key: string
          industry: string
          phone_numbers: string[] | null
          business_hours: Record<string, any> | null
          timezone: string
          primary_goals: string[] | null
          expected_volume: number | null
          success_metrics: string | null
          created_at: string
          updated_at: string
          logo_url: string | null
          description: string | null
          current_volume: string | null
          current_solution: string | null
        }
        Insert: {
          id?: string
          name: string
          company_size: 'small' | 'medium' | 'large'
          member_key: string
          industry: string
          phone_numbers?: string[] | null
          business_hours?: Record<string, any> | null
          timezone: string
          primary_goals?: string[] | null
          expected_volume?: number | null
          success_metrics?: string | null
          created_at?: string
          updated_at?: string
          logo_url?: string | null
          description?: string | null
          current_volume?: string | null
          current_solution?: string | null
        }
        Update: {
          id?: string
          name?: string
          company_size?: 'small' | 'medium' | 'large'
          member_key?: string
          industry?: string
          phone_numbers?: string[] | null
          business_hours?: Record<string, any> | null
          timezone?: string
          primary_goals?: string[] | null
          expected_volume?: number | null
          success_metrics?: string | null
          created_at?: string
          updated_at?: string
          logo_url?: string | null
          description?: string | null
          current_volume?: string | null
          current_solution?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'admin' | 'member'
          is_active: boolean
          company_id: string | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'admin' | 'member'
          is_active?: boolean
          company_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'admin' | 'member'
          is_active?: boolean
          company_id?: string | null
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
          company_id: string | null
          call_type: 'inbound' | 'outbound'
          summary: string | null
          sentiment: 'positive' | 'neutral' | 'negative' | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          vapi_call_id: string | null
          vapi_assistant_id: string | null
          recording_url: string | null
          cost_breakdown: Record<string, any> | null
          ended_reason: string | null
        }
        Insert: {
          id?: string
          caller_number: string
          recipient_number?: string | null
          duration?: number
          transcript?: string | null
          resolution_status?: 'pending' | 'resolved' | 'escalated' | 'failed'
          created_at?: string
          updated_at?: string
          company_id?: string | null
          call_type?: 'inbound' | 'outbound'
          summary?: string | null
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          vapi_call_id?: string | null
          vapi_assistant_id?: string | null
          recording_url?: string | null
          cost_breakdown?: Record<string, any> | null
          ended_reason?: string | null
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
          company_id?: string | null
          call_type?: 'inbound' | 'outbound'
          summary?: string | null
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          vapi_call_id?: string | null
          vapi_assistant_id?: string | null
          recording_url?: string | null
          cost_breakdown?: Record<string, any> | null
          ended_reason?: string | null
        }
      }
      vapi_assistants: {
        Row: {
          id: string
          company_id: string
          vapi_assistant_id: string
          name: string
          description: string | null
          system_prompt: string
          first_message: string
          model_config: Record<string, any>
          voice_config: Record<string, any>
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          vapi_assistant_id: string
          name: string
          description?: string | null
          system_prompt: string
          first_message: string
          model_config?: Record<string, any>
          voice_config?: Record<string, any>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          vapi_assistant_id?: string
          name?: string
          description?: string | null
          system_prompt?: string
          first_message?: string
          model_config?: Record<string, any>
          voice_config?: Record<string, any>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vapi_knowledge_bases: {
        Row: {
          id: string
          company_id: string
          vapi_kb_id: string
          name: string
          description: string | null
          provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          vapi_kb_id: string
          name: string
          description?: string | null
          provider?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          vapi_kb_id?: string
          name?: string
          description?: string | null
          provider?: string
          created_at?: string
          updated_at?: string
        }
      }
      vapi_kb_files: {
        Row: {
          id: string
          knowledge_base_id: string
          vapi_file_id: string
          filename: string
          file_size: number | null
          mime_type: string | null
          file_url: string | null
          parsing_status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          knowledge_base_id: string
          vapi_file_id: string
          filename: string
          file_size?: number | null
          mime_type?: string | null
          file_url?: string | null
          parsing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          knowledge_base_id?: string
          vapi_file_id?: string
          filename?: string
          file_size?: number | null
          mime_type?: string | null
          file_url?: string | null
          parsing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
        }
      }
      vapi_phone_numbers: {
        Row: {
          id: string
          company_id: string
          vapi_phone_id: string
          phone_number: string
          assistant_id: string | null
          provider: 'vapi' | 'twilio' | 'vonage' | 'telnyx' | 'byo'
          country_code: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          vapi_phone_id: string
          phone_number: string
          assistant_id?: string | null
          provider?: 'vapi' | 'twilio' | 'vonage' | 'telnyx' | 'byo'
          country_code?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          vapi_phone_id?: string
          phone_number?: string
          assistant_id?: string | null
          provider?: 'vapi' | 'twilio' | 'vonage' | 'telnyx' | 'byo'
          country_code?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_company_id_from_vapi_phone: {
        Args: { p_vapi_phone_id: string }
        Returns: string
      }
      get_assistant_by_phone_number: {
        Args: { p_phone_number: string }
        Returns: {
          assistant_id: string
          vapi_assistant_id: string
          system_prompt: string
          first_message: string
          model_config: Record<string, any>
          voice_config: Record<string, any>
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
