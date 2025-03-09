export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          credits: number
          trial_credits: number
          billing_address: Json | null
          payment_method: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          credits?: number
          trial_credits?: number
          billing_address?: Json | null
          payment_method?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          credits?: number
          trial_credits?: number
          billing_address?: Json | null
          payment_method?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
        }
      }
      products: {
        Row: {
          id: string
          active: boolean | null
          name: string | null
          description: string | null
          image: string | null
          metadata: Json | null
        }
        Insert: {
          id: string
          active?: boolean | null
          name?: string | null
          description?: string | null
          image?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          active?: boolean | null
          name?: string | null
          description?: string | null
          image?: string | null
          metadata?: Json | null
        }
      }
      prices: {
        Row: {
          id: string
          product_id: string | null
          active: boolean | null
          description: string | null
          unit_amount: number | null
          currency: string | null
          type: Database['public']['Enums']['pricing_type'] | null
          interval: Database['public']['Enums']['pricing_plan_interval'] | null
          interval_count: number | null
          trial_period_days: number | null
          metadata: Json | null
        }
        Insert: {
          id: string
          product_id?: string | null
          active?: boolean | null
          description?: string | null
          unit_amount?: number | null
          currency?: string | null
          type?: Database['public']['Enums']['pricing_type'] | null
          interval?: Database['public']['Enums']['pricing_plan_interval'] | null
          interval_count?: number | null
          trial_period_days?: number | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          product_id?: string | null
          active?: boolean | null
          description?: string | null
          unit_amount?: number | null
          currency?: string | null
          type?: Database['public']['Enums']['pricing_type'] | null
          interval?: Database['public']['Enums']['pricing_plan_interval'] | null
          interval_count?: number | null
          trial_period_days?: number | null
          metadata?: Json | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: Database['public']['Enums']['subscription_status'] | null
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          cancel_at_period_end: boolean | null
          created: string | null
          current_period_start: string | null
          current_period_end: string | null
          ended_at: string | null
          cancel_at: string | null
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
        }
        Insert: {
          id: string
          user_id: string
          status?: Database['public']['Enums']['subscription_status'] | null
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          cancel_at_period_end?: boolean | null
          created?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          ended_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: Database['public']['Enums']['subscription_status'] | null
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          cancel_at_period_end?: boolean | null
          created?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          ended_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
        }
      }
      integrations: {
        Row: {
          id: string
          user_id: string
          dashboard_id: string
          organization_id: string
          private_api_key: string
          public_api_key: string
          type: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dashboard_id: string
          organization_id: string
          private_api_key?: string
          public_api_key?: string
          type: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dashboard_id?: string
          organization_id?: string
          private_api_key?: string
          public_api_key?: string
          type?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      wallet_usage: {
        Row: {
          id: string
          wallet_id: string
          amount: number
          description: string | null
          transaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          wallet_id: string
          amount: number
          description?: string | null
          transaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          wallet_id?: string
          amount?: number
          description?: string | null
          transaction_type?: string
          created_at?: string
        }
      }
      agencies: {
        Row: {
          id: string
          name: string
          owner_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      agency_clients: {
        Row: {
          id: string
          agency_id: string
          client_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          client_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          client_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      affiliate_links: {
        Row: {
          id: string
          user_id: string
          affiliate_id: string
          name: string
          destination_url: string
          unique_code: string
          is_active: boolean
          total_clicks: number
          unique_clicks: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          affiliate_id: string
          name: string
          destination_url: string
          unique_code: string
          is_active?: boolean
          total_clicks?: number
          unique_clicks?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          affiliate_id?: string
          name?: string
          destination_url?: string
          unique_code?: string
          is_active?: boolean
          total_clicks?: number
          unique_clicks?: number
          created_at?: string
          updated_at?: string
        }
      }
      affiliate_conversions: {
        Row: {
          id: string
          affiliate_link_id: string
          referred_user_id: string | null
          amount: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          affiliate_link_id: string
          referred_user_id?: string | null
          amount?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          affiliate_link_id?: string
          referred_user_id?: string | null
          amount?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      chatbot_configs: {
        Row: {
          id: string
          user_id: string
          connected: boolean
          config: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          connected?: boolean
          config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          connected?: boolean
          config?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      calendar_integrations: {
        Row: {
          id: string
          user_id: string
          api_key: string
          provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          api_key: string
          provider?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          api_key?: string
          provider?: string
          created_at?: string
          updated_at?: string
        }
      }
      retell_agents: {
        Row: {
          id: string
          user_id: string
          agent_id: string
          agent_name: string | null
          voice_id: string
          llm_websocket_url: string
          configuration: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent_id: string
          agent_name?: string | null
          voice_id: string
          llm_websocket_url: string
          configuration?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent_id?: string
          agent_name?: string | null
          voice_id?: string
          llm_websocket_url?: string
          configuration?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      retell_calls: {
        Row: {
          id: string
          user_id: string
          agent_id: string | null
          call_id: string
          call_status: string | null
          call_type: string | null
          start_timestamp: number | null
          end_timestamp: number | null
          duration_seconds: number | null
          call_cost: number | null
          recording_url: string | null
          transcript: string | null
          call_analysis: Json | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent_id?: string | null
          call_id: string
          call_status?: string | null
          call_type?: string | null
          start_timestamp?: number | null
          end_timestamp?: number | null
          duration_seconds?: number | null
          call_cost?: number | null
          recording_url?: string | null
          transcript?: string | null
          call_analysis?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent_id?: string | null
          call_id?: string
          call_status?: string | null
          call_type?: string | null
          start_timestamp?: number | null
          end_timestamp?: number | null
          duration_seconds?: number | null
          call_cost?: number | null
          recording_url?: string | null
          transcript?: string | null
          call_analysis?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
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
      pricing_plan_interval: 'day' | 'week' | 'month' | 'year'
      pricing_type: 'one_time' | 'recurring'
      subscription_status: 'trial' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused'
      user_role: 'sudo' | 'owner' | 'admin' | 'user'
      subscription_tier: 'starter' | 'professional' | 'enterprise' | 'trial'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
