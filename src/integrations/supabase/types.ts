export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          attendance_date: string
          created_at: string
          event_id: string | null
          id: string
          member_id: string | null
          notes: string | null
          present: boolean | null
          updated_at: string
        }
        Insert: {
          attendance_date?: string
          created_at?: string
          event_id?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          present?: boolean | null
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          created_at?: string
          event_id?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          present?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          communication_type: string | null
          created_at: string
          id: string
          message: string
          sent_by: string | null
          sent_date: string | null
          status: string | null
          subject: string
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          communication_type?: string | null
          created_at?: string
          id?: string
          message: string
          sent_by?: string | null
          sent_date?: string | null
          status?: string | null
          subject: string
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          communication_type?: string | null
          created_at?: string
          id?: string
          message?: string
          sent_by?: string | null
          sent_date?: string | null
          status?: string | null
          subject?: string
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          donation_date: string
          donation_type: string | null
          donor_email: string | null
          donor_name: string
          donor_phone: string | null
          id: string
          is_recurring: boolean | null
          notes: string | null
          payment_method: string | null
          reference_number: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          donation_date?: string
          donation_type?: string | null
          donor_email?: string | null
          donor_name: string
          donor_phone?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          payment_method?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          donation_date?: string
          donation_type?: string | null
          donor_email?: string | null
          donor_name?: string
          donor_phone?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          payment_method?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          current_attendees: number | null
          description: string | null
          end_time: string | null
          event_date: string
          event_type: string | null
          id: string
          location: string | null
          max_attendees: number | null
          registration_required: boolean | null
          start_time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          location?: string | null
          max_attendees?: number | null
          registration_required?: boolean | null
          start_time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          location?: string | null
          max_attendees?: number | null
          registration_required?: boolean | null
          start_time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          address: string | null
          alternate_phone_number: string | null
          baptism_status: Database["public"]["Enums"]["baptism_status"] | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          department: Database["public"]["Enums"]["department_type"] | null
          education: Database["public"]["Enums"]["education_type"] | null
          email: string | null
          emergency_contact: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          group: Database["public"]["Enums"]["group_type"] | null
          home_town: string | null
          id: string
          last_name: string
          marital_status:
            | Database["public"]["Enums"]["marital_status_type"]
            | null
          member_id: string | null
          membership_date: string | null
          membership_status: Database["public"]["Enums"]["member_status"] | null
          membership_type: Database["public"]["Enums"]["membership_type"] | null
          ministry: Database["public"]["Enums"]["ministry_type"] | null
          occupation: string | null
          phone_number: string | null
          postal_code: string | null
          profile_image_url: string | null
          role: string | null
          state: string | null
          tithe_number: string | null
          updated_at: string
          volunteer_preferences_can_lead_group: boolean | null
        }
        Insert: {
          address?: string | null
          alternate_phone_number?: string | null
          baptism_status?: Database["public"]["Enums"]["baptism_status"] | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          education?: Database["public"]["Enums"]["education_type"] | null
          email?: string | null
          emergency_contact?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          group?: Database["public"]["Enums"]["group_type"] | null
          home_town?: string | null
          id?: string
          last_name: string
          marital_status?:
            | Database["public"]["Enums"]["marital_status_type"]
            | null
          member_id?: string | null
          membership_date?: string | null
          membership_status?:
            | Database["public"]["Enums"]["member_status"]
            | null
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          ministry?: Database["public"]["Enums"]["ministry_type"] | null
          occupation?: string | null
          phone_number?: string | null
          postal_code?: string | null
          profile_image_url?: string | null
          role?: string | null
          state?: string | null
          tithe_number?: string | null
          updated_at?: string
          volunteer_preferences_can_lead_group?: boolean | null
        }
        Update: {
          address?: string | null
          alternate_phone_number?: string | null
          baptism_status?: Database["public"]["Enums"]["baptism_status"] | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          education?: Database["public"]["Enums"]["education_type"] | null
          email?: string | null
          emergency_contact?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          group?: Database["public"]["Enums"]["group_type"] | null
          home_town?: string | null
          id?: string
          last_name?: string
          marital_status?:
            | Database["public"]["Enums"]["marital_status_type"]
            | null
          member_id?: string | null
          membership_date?: string | null
          membership_status?:
            | Database["public"]["Enums"]["member_status"]
            | null
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          ministry?: Database["public"]["Enums"]["ministry_type"] | null
          occupation?: string | null
          phone_number?: string | null
          postal_code?: string | null
          profile_image_url?: string | null
          role?: string | null
          state?: string | null
          tithe_number?: string | null
          updated_at?: string
          volunteer_preferences_can_lead_group?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          first_name: string
          follow_up_date: string | null
          follow_up_required: boolean | null
          how_did_you_hear_about_us: string | null
          id: string
          last_name: string
          notes: string | null
          phone_number: string | null
          state: string | null
          updated_at: string
          visit_date: string
          visited_before: boolean | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          how_did_you_hear_about_us?: string | null
          id?: string
          last_name: string
          notes?: string | null
          phone_number?: string | null
          state?: string | null
          updated_at?: string
          visit_date?: string
          visited_before?: boolean | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          how_did_you_hear_about_us?: string | null
          id?: string
          last_name?: string
          notes?: string | null
          phone_number?: string | null
          state?: string | null
          updated_at?: string
          visit_date?: string
          visited_before?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      baptism_status: "baptized" | "not_baptized"
      department_type:
        | "music"
        | "usher_cleaner"
        | "media"
        | "finance"
        | "welfare"
        | "sunday_school"
        | "account"
        | "welfare_committee"
        | "choir"
        | "cleaners"
        | "n_a"
      education_type: "primary" | "secondary" | "diploma" | "other"
      gender_type: "male" | "female"
      group_type:
        | "prayer"
        | "evangelism"
        | "follow_up"
        | "leaders"
        | "prayer_tower"
        | "usher"
        | "youth_ministry"
      marital_status_type: "single" | "married" | "divorced" | "widowed"
      member_role: "admin" | "member" | "guest"
      member_status: "active" | "inactive"
      membership_type:
        | "full_member"
        | "friend_of_church"
        | "new_convert"
        | "visitor"
        | "others"
        | "regular"
        | "leadership"
      ministry_type:
        | "men_ministry"
        | "youth_ministry"
        | "women_ministry"
        | "children_ministry"
        | "all"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      baptism_status: ["baptized", "not_baptized"],
      department_type: [
        "music",
        "usher_cleaner",
        "media",
        "finance",
        "welfare",
        "sunday_school",
        "account",
        "welfare_committee",
        "choir",
        "cleaners",
        "n_a",
      ],
      education_type: ["primary", "secondary", "diploma", "other"],
      gender_type: ["male", "female"],
      group_type: [
        "prayer",
        "evangelism",
        "follow_up",
        "leaders",
        "prayer_tower",
        "usher",
        "youth_ministry",
      ],
      marital_status_type: ["single", "married", "divorced", "widowed"],
      member_role: ["admin", "member", "guest"],
      member_status: ["active", "inactive"],
      membership_type: [
        "full_member",
        "friend_of_church",
        "new_convert",
        "visitor",
        "others",
        "regular",
        "leadership",
      ],
      ministry_type: [
        "men_ministry",
        "youth_ministry",
        "women_ministry",
        "children_ministry",
        "all",
      ],
    },
  },
} as const
