// Generated types for Supabase

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          email: string | null
          phone_number: string | null
          avatar_url: string | null
          date_of_birth: string | null
          gender: string | null
          address: string | null
          membership_status: string | null
          membership_type: string | null
          date_joined: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          email?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          membership_status?: string | null
          membership_type?: string | null
          date_joined?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          membership_status?: string | null
          membership_type?: string | null
          date_joined?: string | null
          user_id?: string | null
        }
      }
      // Add other table definitions as needed
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type Enums = Record<string, never> // Empty object type for enums
