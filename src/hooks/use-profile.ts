import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { isMockMode } from '../lib/mock-mode'
import { getMockProfileByUsername, getMockWagersForUser } from '../mock/data'
import type { MarketStatus, MarketOutcome, WagerPrediction } from '../types/database'

export interface WagerWithMarket {
  id: string
  market_id: string
  prediction: WagerPrediction
  amount: number
  payout: number | null
  created_at: string
  markets: {
    route_id: string
    stop_name: string
    scheduled_arrival: string
    outcome: MarketOutcome | null
    status: MarketStatus
  }
}

export function useProfile(username: string | undefined) {
  const profileQuery = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      if (!username) throw new Error('No username')
      if (isMockMode()) {
        const row = getMockProfileByUsername(username)
        if (!row) throw new Error('Profile not found')
        return row
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, credits_balance, created_at')
        .eq('username', username)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!username,
    staleTime: 30_000,
  })

  const wagersQuery = useQuery({
    queryKey: ['profile-wagers', profileQuery.data?.id],
    queryFn: async () => {
      if (isMockMode()) {
        return getMockWagersForUser(profileQuery.data!.id) as WagerWithMarket[]
      }
      const { data, error } = await supabase
        .from('wagers')
        .select(`
          id, market_id, prediction, amount, payout, created_at,
          markets(route_id, stop_name, scheduled_arrival, outcome, status)
        `)
        .eq('user_id', profileQuery.data!.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as unknown as WagerWithMarket[]
    },
    enabled: !!profileQuery.data?.id,
    staleTime: 30_000,
  })

  return { profileQuery, wagersQuery }
}

export function useMyWagers(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-wagers', userId],
    queryFn: async () => {
      if (isMockMode()) {
        return getMockWagersForUser(userId!) as WagerWithMarket[]
      }
      const { data, error } = await supabase
        .from('wagers')
        .select(`
          id, market_id, prediction, amount, payout, created_at,
          markets(route_id, stop_name, scheduled_arrival, outcome, status)
        `)
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data as unknown as WagerWithMarket[]
    },
    enabled: !!userId,
    staleTime: 30_000,
  })
}
