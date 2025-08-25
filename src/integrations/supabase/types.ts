export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bids: {
        Row: {
          amount: number | null
          attachments: string[] | null
          bidder_name: string
          bidder_type: string | null
          conditions: string[] | null
          created_at: string | null
          currency: string | null
          id: string
          phase: string | null
          status: string | null
          submitted_by: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          attachments?: string[] | null
          bidder_name: string
          bidder_type?: string | null
          conditions?: string[] | null
          created_at?: string | null
          currency?: string | null
          id?: string
          phase?: string | null
          status?: string | null
          submitted_by?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          attachments?: string[] | null
          bidder_name?: string
          bidder_type?: string | null
          conditions?: string[] | null
          created_at?: string | null
          currency?: string | null
          id?: string
          phase?: string | null
          status?: string | null
          submitted_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      deal_settings: {
        Row: {
          audit_logging: boolean | null
          bid_notifications: boolean | null
          closing_expected: string | null
          created_at: string | null
          deal_name: string
          deal_type: string | null
          download_restrictions: boolean | null
          email_alerts: boolean | null
          final_bid_deadline: string | null
          id: string
          nbo_deadline: string | null
          phase: string | null
          qa_notifications: boolean | null
          updated_at: string | null
          watermark_enabled: boolean | null
        }
        Insert: {
          audit_logging?: boolean | null
          bid_notifications?: boolean | null
          closing_expected?: string | null
          created_at?: string | null
          deal_name: string
          deal_type?: string | null
          download_restrictions?: boolean | null
          email_alerts?: boolean | null
          final_bid_deadline?: string | null
          id?: string
          nbo_deadline?: string | null
          phase?: string | null
          qa_notifications?: boolean | null
          updated_at?: string | null
          watermark_enabled?: boolean | null
        }
        Update: {
          audit_logging?: boolean | null
          bid_notifications?: boolean | null
          closing_expected?: string | null
          created_at?: string | null
          deal_name?: string
          deal_type?: string | null
          download_restrictions?: boolean | null
          email_alerts?: boolean | null
          final_bid_deadline?: string | null
          id?: string
          nbo_deadline?: string | null
          phase?: string | null
          qa_notifications?: boolean | null
          updated_at?: string | null
          watermark_enabled?: boolean | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          access_level: string | null
          created_at: string | null
          file_path: string | null
          id: string
          name: string
          parent_id: string | null
          size: string | null
          type: string
          updated_at: string | null
          uploaded_by: string | null
          watermark: boolean | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          file_path?: string | null
          id?: string
          name: string
          parent_id?: string | null
          size?: string | null
          type: string
          updated_at?: string | null
          uploaded_by?: string | null
          watermark?: boolean | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          file_path?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          size?: string | null
          type?: string
          updated_at?: string | null
          uploaded_by?: string | null
          watermark?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          access_level: string[] | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          last_login: string | null
          organization: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_level?: string[] | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          organization?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_level?: string[] | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          organization?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      qa_threads: {
        Row: {
          answer: string | null
          answered_by: string | null
          asked_by: string
          attachments: string[] | null
          category: string
          created_at: string | null
          id: string
          priority: string | null
          question: string
          status: string | null
          title: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          answer?: string | null
          answered_by?: string | null
          asked_by: string
          attachments?: string[] | null
          category: string
          created_at?: string | null
          id?: string
          priority?: string | null
          question: string
          status?: string | null
          title: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          answer?: string | null
          answered_by?: string | null
          asked_by?: string
          attachments?: string[] | null
          category?: string
          created_at?: string | null
          id?: string
          priority?: string | null
          question?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          participants: string[] | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          participants?: string[] | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          participants?: string[] | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
