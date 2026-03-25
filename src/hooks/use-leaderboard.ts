import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type TimePeriod = '24h' | '7d' | '30d' | 'all'

export interface LeaderboardEntry {
  user_id: string
  username: string
  net_profit: number
  total_wagered: number
  wager_count: number
}

function getStartDate(period: TimePeriod): string | null {
  if (period === 'all') return null
  const now = new Date()
  const days: Record<TimePeriod, number> = { '24h': 1, '7d': 7, '30d': 30, all: 0 }
  now.setDate(now.getDate() - days[period])
  return now.toISOString()
}

export function useLeaderboard(period: TimePeriod) {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const startDate = getStartDate(period)

      let query = supabase
        .from('wagers')
        .select('user_id, amount, payout, profiles(username)')
        .not('payout', 'is', null)

      if (startDate) {
        query = query.gte('created_at', startDate)
      }

      const { data, error } = await query
      if (error) throw error

      const byUser = new Map<string, LeaderboardEntry>()
      for (const w of data ?? []) {
        const profileData = w.profiles as unknown as { username: string | null } | null
        const username = profileData?.username
        if (!username) continue

        const existing = byUser.get(w.user_id) ?? {
          user_id: w.user_id,
          username,
          net_profit: 0,
          total_wagered: 0,
          wager_count: 0,
        }
        existing.net_profit += (w.payout ?? 0) - w.amount
        existing.total_wagered += w.amount
        existing.wager_count += 1
        byUser.set(w.user_id, existing)
      }

      return Array.from(byUser.values()).sort((a, b) => b.net_profit - a.net_profit)
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
