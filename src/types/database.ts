export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MarketStatus = 'open' | 'closed' | 'settled' | 'cancelled'
export type MarketOutcome = 'on_time' | 'late'
export type WagerPrediction = 'on_time' | 'late'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          credits_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          credits_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          credits_balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      markets: {
        Row: {
          id: string
          trip_id: string
          route_id: string
          stop_id: string
          stop_name: string
          scheduled_arrival: string
          latest_predicted_arrival: string | null
          status: MarketStatus
          outcome: MarketOutcome | null
          actual_arrival: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          route_id: string
          stop_id: string
          stop_name: string
          scheduled_arrival: string
          latest_predicted_arrival?: string | null
          status?: MarketStatus
          outcome?: MarketOutcome | null
          actual_arrival?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          trip_id?: string
          route_id?: string
          stop_id?: string
          stop_name?: string
          scheduled_arrival?: string
          latest_predicted_arrival?: string | null
          status?: MarketStatus
          outcome?: MarketOutcome | null
          actual_arrival?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      wagers: {
        Row: {
          id: string
          user_id: string
          market_id: string
          prediction: WagerPrediction
          amount: number
          payout: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          market_id: string
          prediction: WagerPrediction
          amount: number
          payout?: number | null
          created_at?: string
        }
        Update: {
          payout?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'wagers_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wagers_market_id_fkey'
            columns: ['market_id']
            isOneToOne: false
            referencedRelation: 'markets'
            referencedColumns: ['id']
          },
        ]
      }
      stop_stats: {
        Row: {
          id: string
          stop_id: string
          route_id: string
          on_time_rate: number
          sample_count: number
          updated_at: string
        }
        Insert: {
          id?: string
          stop_id: string
          route_id: string
          on_time_rate: number
          sample_count: number
          updated_at?: string
        }
        Update: {
          on_time_rate?: number
          sample_count?: number
          updated_at?: string
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
      market_status: MarketStatus
      market_outcome: MarketOutcome
      wager_prediction: WagerPrediction
    }
  }
}
