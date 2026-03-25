import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Market = Database['public']['Tables']['markets']['Row']

interface MarketsFilter {
  line?: string | null
  search?: string
}

export function useMarkets(filter: MarketsFilter = {}) {
  return useQuery<Market[]>({
    queryKey: ['markets', filter],
    queryFn: async () => {
      let query = supabase
        .from('markets')
        .select('*')
        .in('status', ['open', 'closed'])
        .gte(
          'scheduled_arrival',
          new Date(Date.now() - 10 * 60_000).toISOString(),
        )
        .lte(
          'scheduled_arrival',
          new Date(Date.now() + 2 * 3_600_000).toISOString(),
        )
        .order('scheduled_arrival', { ascending: true })

      if (filter.line) {
        query = query.eq('route_id', filter.line)
      }
      if (filter.search) {
        query = query.ilike('stop_name', `%${filter.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    refetchInterval: 30_000,
  })
}
