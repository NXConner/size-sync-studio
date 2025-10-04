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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analysis_reports: {
        Row: {
          analysis_results: Json
          analysis_type: string
          consent_verified: boolean | null
          created_at: string
          id: string
          insights: Json
          partner_consent_verified: boolean | null
          partner_id: string | null
          privacy_level: string
          recommendations: Json
          session_metadata: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_results?: Json
          analysis_type?: string
          consent_verified?: boolean | null
          created_at?: string
          id?: string
          insights?: Json
          partner_consent_verified?: boolean | null
          partner_id?: string | null
          privacy_level?: string
          recommendations?: Json
          session_metadata?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_results?: Json
          analysis_type?: string
          consent_verified?: boolean | null
          created_at?: string
          id?: string
          insights?: Json
          partner_consent_verified?: boolean | null
          partner_id?: string | null
          privacy_level?: string
          recommendations?: Json
          session_metadata?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendars: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          event_type: string
          id: string
          is_private: boolean | null
          partner_id: string | null
          start_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          event_type?: string
          id?: string
          is_private?: boolean | null
          partner_id?: string | null
          start_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          event_type?: string
          id?: string
          is_private?: boolean | null
          partner_id?: string | null
          start_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chats: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      communication_exercises: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty_level: string
          estimated_time_minutes: number
          id: string
          instructions: Json
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty_level: string
          estimated_time_minutes: number
          id?: string
          instructions: Json
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty_level?: string
          estimated_time_minutes?: number
          id?: string
          instructions?: Json
          title?: string
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          consent_details: Json
          consent_given: boolean | null
          consent_type: string
          created_at: string
          expires_at: string | null
          id: string
          ip_address: unknown | null
          partner_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_details?: Json
          consent_given?: boolean | null
          consent_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          partner_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_details?: Json
          consent_given?: boolean | null
          consent_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          partner_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          created_at: string
          date: string
          gratitude_note: string | null
          id: string
          mood_score: number
          relationship_satisfaction: number
          stress_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          gratitude_note?: string | null
          id?: string
          mood_score: number
          relationship_satisfaction: number
          stress_level: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          gratitude_note?: string | null
          id?: string
          mood_score?: number
          relationship_satisfaction?: number
          stress_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_completions: {
        Row: {
          completion_date: string
          created_at: string
          exercise_id: string
          id: string
          partner_id: string | null
          rating: number | null
          reflection_notes: string | null
          user_id: string
        }
        Insert: {
          completion_date?: string
          created_at?: string
          exercise_id: string
          id?: string
          partner_id?: string | null
          rating?: number | null
          reflection_notes?: string | null
          user_id: string
        }
        Update: {
          completion_date?: string
          created_at?: string
          exercise_id?: string
          id?: string
          partner_id?: string | null
          rating?: number | null
          reflection_notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_completions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "communication_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          current: number
          deadline: string | null
          id: string
          is_active: boolean
          target: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current: number
          deadline?: string | null
          id?: string
          is_active?: boolean
          target: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current?: number
          deadline?: string | null
          id?: string
          is_active?: boolean
          target?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      measurements: {
        Row: {
          created_at: string
          date: string
          girth: number
          id: string
          is_pre_session: boolean | null
          length: number
          notes: string | null
          photo_url: string | null
          session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          girth: number
          id?: string
          is_pre_session?: boolean | null
          length: number
          notes?: string | null
          photo_url?: string | null
          session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          girth?: number
          id?: string
          is_pre_session?: boolean | null
          length?: number
          notes?: string | null
          photo_url?: string | null
          session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_measurement_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      menstrual_cycles: {
        Row: {
          created_at: string
          cycle_length: number | null
          end_date: string | null
          flow_intensity: string | null
          id: string
          is_predicted: boolean | null
          notes: string | null
          shared_with_partner: boolean | null
          start_date: string
          symptoms: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_length?: number | null
          end_date?: string | null
          flow_intensity?: string | null
          id?: string
          is_predicted?: boolean | null
          notes?: string | null
          shared_with_partner?: boolean | null
          start_date: string
          symptoms?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_length?: number | null
          end_date?: string | null
          flow_intensity?: string | null
          id?: string
          is_predicted?: boolean | null
          notes?: string | null
          shared_with_partner?: boolean | null
          start_date?: string
          symptoms?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          id: string
          mood: string
          mood_score: number
          notes: string | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          energy_level?: number | null
          id?: string
          mood: string
          mood_score: number
          notes?: string | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          id?: string
          mood?: string
          mood_score?: number
          notes?: string | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          invitation_code: string | null
          love_language: string | null
          partner_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          invitation_code?: string | null
          love_language?: string | null
          partner_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          invitation_code?: string | null
          love_language?: string | null
          partner_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          quiz_id: string
          results: Json
          score: number | null
          user_id: string
        }
        Insert: {
          answers: Json
          completed_at?: string
          id?: string
          quiz_id: string
          results: Json
          score?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          quiz_id?: string
          results?: Json
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          questions: Json
          scoring_logic: Json
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          questions: Json
          scoring_logic: Json
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          questions?: Json
          scoring_logic?: Json
          title?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          category: string
          created_at: string
          data_sources: Json | null
          description: string
          expires_at: string | null
          id: string
          interaction_count: number | null
          is_active: boolean | null
          last_shown_at: string | null
          partner_id: string | null
          personalization_score: number | null
          priority: number | null
          recommendation_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          data_sources?: Json | null
          description: string
          expires_at?: string | null
          id?: string
          interaction_count?: number | null
          is_active?: boolean | null
          last_shown_at?: string | null
          partner_id?: string | null
          personalization_score?: number | null
          priority?: number | null
          recommendation_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          data_sources?: Json | null
          description?: string
          expires_at?: string | null
          id?: string
          interaction_count?: number | null
          is_active?: boolean | null
          last_shown_at?: string | null
          partner_id?: string | null
          personalization_score?: number | null
          priority?: number | null
          recommendation_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      relationship_goals: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          partner_id: string | null
          progress_percentage: number | null
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          partner_id?: string | null
          progress_percentage?: number | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          partner_id?: string | null
          progress_percentage?: number | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_breaks: {
        Row: {
          end_time: string | null
          id: string
          session_id: string
          start_time: string
        }
        Insert: {
          end_time?: string | null
          id?: string
          session_id: string
          start_time: string
        }
        Update: {
          end_time?: string | null
          id?: string
          session_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_breaks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_pressure_logs: {
        Row: {
          id: string
          pressure: number
          session_id: string
          timestamp: string
        }
        Insert: {
          id?: string
          pressure: number
          session_id: string
          timestamp: string
        }
        Update: {
          id?: string
          pressure?: number
          session_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_pressure_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_tube_intervals: {
        Row: {
          end_time: string | null
          id: string
          session_id: string
          start_time: string
        }
        Insert: {
          end_time?: string | null
          id?: string
          session_id: string
          start_time: string
        }
        Update: {
          end_time?: string | null
          id?: string
          session_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_tube_intervals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          date: string
          end_time: string | null
          id: string
          notes: string | null
          preset_id: string
          start_time: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          notes?: string | null
          preset_id: string
          start_time: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          preset_id?: string
          start_time?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_status: {
        Row: {
          created_at: string
          features: Json
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_ends_at: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          notifications: Json | null
          privacy_settings: Json | null
          theme_preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notifications?: Json | null
          privacy_settings?: Json | null
          theme_preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notifications?: Json | null
          privacy_settings?: Json | null
          theme_preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences_app: {
        Row: {
          accessibility: Json | null
          created_at: string
          notifications: Json | null
          privacy: Json | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility?: Json | null
          created_at?: string
          notifications?: Json | null
          privacy?: Json | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility?: Json | null
          created_at?: string
          notifications?: Json | null
          privacy?: Json | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_role: {
        Args: { user_email: string }
        Returns: boolean
      }
      calculate_cycle_predictions: {
        Args: { p_user_id: string }
        Returns: {
          confidence_score: number
          cycle_length: number
          predicted_end: string
          predicted_start: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
