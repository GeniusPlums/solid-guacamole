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
      brand_profiles: {
        Row: {
          company_name: string
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string
          budget: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          max_followers: number | null
          min_followers: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          target_engagement_rate: number | null
          target_niche: string[] | null
          target_platforms: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          max_followers?: number | null
          min_followers?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_engagement_rate?: number | null
          target_niche?: string[] | null
          target_platforms?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          max_followers?: number | null
          min_followers?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_engagement_rate?: number | null
          target_niche?: string[] | null
          target_platforms?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborations: {
        Row: {
          brand_id: string
          campaign_id: string
          created_at: string
          deadline: string | null
          deliverables: string | null
          id: string
          influencer_id: string
          notes: string | null
          offered_amount: number | null
          status: Database["public"]["Enums"]["collaboration_status"] | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          campaign_id: string
          created_at?: string
          deadline?: string | null
          deliverables?: string | null
          id?: string
          influencer_id: string
          notes?: string | null
          offered_amount?: number | null
          status?: Database["public"]["Enums"]["collaboration_status"] | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          campaign_id?: string
          created_at?: string
          deadline?: string | null
          deliverables?: string | null
          id?: string
          influencer_id?: string
          notes?: string | null
          offered_amount?: number | null
          status?: Database["public"]["Enums"]["collaboration_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborations_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_profiles: {
        Row: {
          bio: string | null
          content_samples: string[] | null
          created_at: string
          engagement_rate: number | null
          id: string
          instagram_followers: number | null
          instagram_handle: string | null
          languages: string[] | null
          location: string | null
          niche: string[] | null
          portfolio_images: string[] | null
          rating: number | null
          tiktok_followers: number | null
          tiktok_handle: string | null
          total_collaborations: number | null
          twitter_followers: number | null
          twitter_handle: string | null
          updated_at: string
          user_id: string
          youtube_handle: string | null
          youtube_subscribers: number | null
        }
        Insert: {
          bio?: string | null
          content_samples?: string[] | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          instagram_followers?: number | null
          instagram_handle?: string | null
          languages?: string[] | null
          location?: string | null
          niche?: string[] | null
          portfolio_images?: string[] | null
          rating?: number | null
          tiktok_followers?: number | null
          tiktok_handle?: string | null
          total_collaborations?: number | null
          twitter_followers?: number | null
          twitter_handle?: string | null
          updated_at?: string
          user_id: string
          youtube_handle?: string | null
          youtube_subscribers?: number | null
        }
        Update: {
          bio?: string | null
          content_samples?: string[] | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          instagram_followers?: number | null
          instagram_handle?: string | null
          languages?: string[] | null
          location?: string | null
          niche?: string[] | null
          portfolio_images?: string[] | null
          rating?: number | null
          tiktok_followers?: number | null
          tiktok_handle?: string | null
          total_collaborations?: number | null
          twitter_followers?: number | null
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string
          youtube_handle?: string | null
          youtube_subscribers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          collaboration_id: string | null
          content: string
          created_at: string
          from_user_id: string
          id: string
          read: boolean | null
          to_user_id: string
        }
        Insert: {
          collaboration_id?: string | null
          content: string
          created_at?: string
          from_user_id: string
          id?: string
          read?: boolean | null
          to_user_id: string
        }
        Update: {
          collaboration_id?: string | null
          content?: string
          created_at?: string
          from_user_id?: string
          id?: string
          read?: boolean | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
          user_type: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      ratings: {
        Row: {
          collaboration_id: string
          created_at: string
          from_user_id: string
          id: string
          rating: number
          review: string | null
          to_user_id: string
        }
        Insert: {
          collaboration_id: string
          created_at?: string
          from_user_id: string
          id?: string
          rating: number
          review?: string | null
          to_user_id: string
        }
        Update: {
          collaboration_id?: string
          created_at?: string
          from_user_id?: string
          id?: string
          rating?: number
          review?: string | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      campaign_status: "draft" | "active" | "paused" | "completed" | "cancelled"
      collaboration_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "completed"
        | "cancelled"
      user_role: "brand" | "influencer"
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
      campaign_status: ["draft", "active", "paused", "completed", "cancelled"],
      collaboration_status: [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled",
      ],
      user_role: ["brand", "influencer"],
    },
  },
} as const
