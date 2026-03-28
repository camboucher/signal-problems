import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { isMockMode } from '../lib/mock-mode'
import {
  getMockMarketById,
  getMockStopStats,
  getMockWagersForMarket,
} from '../mock/data'
import type { Database } from '../types/database'

type Market = Database['public']['Tables']['markets']['Row']
type Wager = Database['public']['Tables']['wagers']['Row']
type StopStat = Database['public']['Tables']['stop_stats']['Row']

export interface WagerWithProfile extends Wager {
  profiles: { username: string | null } | null
}

export function useMarketDetail(id: string | undefined) {
  const market = useQuery<Market>({
    queryKey: ['market', id],
    queryFn: async () => {
      if (!id) throw new Error('Missing market ID')
      if (isMockMode()) {
        const m = getMockMarketById(id)
        if (!m) throw new Error('Market not found')
        return m
      }
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
    refetchInterval: isMockMode() ? false : 15_000,
  })

  const wagers = useQuery<WagerWithProfile[]>({
    queryKey: ['market-wagers', id],
    queryFn: async () => {
      if (!id) throw new Error('Missing market ID')
      if (isMockMode()) return getMockWagersForMarket(id) as WagerWithProfile[]
      const { data, error } = await supabase
        .from('wagers')
        .select('*, profiles(username)')
        .eq('market_id', id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as WagerWithProfile[]
    },
    enabled: !!id,
    refetchInterval: isMockMode() ? false : 15_000,
  })

  const stopStats = useQuery<StopStat | null>({
    queryKey: [
      'stop-stats',
      market.data?.stop_id,
      market.data?.route_id,
    ],
    queryFn: async () => {
      if (!market.data) throw new Error('No market data')
      if (isMockMode()) {
        return getMockStopStats(market.data.stop_id, market.data.route_id)
      }
      const { data, error } = await supabase
        .from('stop_stats')
        .select('*')
        .eq('stop_id', market.data.stop_id)
        .eq('route_id', market.data.route_id)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!market.data,
    ...(isMockMode() ? { refetchInterval: false as const } : {}),
  })

  return { market, wagers, stopStats }
}
