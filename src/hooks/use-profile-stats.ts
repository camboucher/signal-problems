import { useMemo } from 'react'
import type { WagerWithMarket } from './use-profile'

export interface LineStats {
  routeId: string
  wagered: number
  netProfit: number
  roi: number
  wagerCount: number
}

type TimeBucket = 'morning' | 'afternoon' | 'evening' | 'night'

export interface TimeOfDayStats {
  bucket: TimeBucket
  wins: number
  total: number
}

export interface StreakStats {
  current: number
  longest: number
  type: 'win' | 'loss' | null
}

export interface ProfileStats {
  roiByLine: LineStats[]
  winRateByTimeOfDay: TimeOfDayStats[]
  avgWagerSize: number
  streak: StreakStats
}

function timeBucket(isoTimestamp: string): TimeBucket {
  const hour = new Date(isoTimestamp).getHours()
  if (hour >= 5 && hour <= 11) return 'morning'
  if (hour >= 12 && hour <= 17) return 'afternoon'
  if (hour >= 18 && hour <= 21) return 'evening'
  return 'night'
}

const BUCKET_ORDER: TimeBucket[] = ['morning', 'afternoon', 'evening', 'night']

export function useProfileStats(wagers: WagerWithMarket[]): ProfileStats {
  return useMemo(() => {
    const settled = wagers.filter((w) => w.markets.status === 'settled' && w.payout !== null)

    // ROI by line
    const lineMap = new Map<string, { wagered: number; profit: number; count: number }>()
    for (const w of settled) {
      const route = w.markets.route_id
      const entry = lineMap.get(route) ?? { wagered: 0, profit: 0, count: 0 }
      entry.wagered += w.amount
      entry.profit += (w.payout ?? 0) - w.amount
      entry.count += 1
      lineMap.set(route, entry)
    }
    const roiByLine: LineStats[] = Array.from(lineMap.entries())
      .map(([routeId, { wagered, profit, count }]) => ({
        routeId,
        wagered,
        netProfit: profit,
        roi: wagered > 0 ? profit / wagered : 0,
        wagerCount: count,
      }))
      .sort((a, b) => Math.abs(b.roi) - Math.abs(a.roi))

    // Win rate by time of day
    const bucketMap = new Map<TimeBucket, { wins: number; total: number }>()
    for (const bucket of BUCKET_ORDER) {
      bucketMap.set(bucket, { wins: 0, total: 0 })
    }
    for (const w of settled) {
      const bucket = timeBucket(w.markets.scheduled_arrival)
      const entry = bucketMap.get(bucket)!
      entry.total += 1
      if ((w.payout ?? 0) > w.amount) entry.wins += 1
    }
    const winRateByTimeOfDay: TimeOfDayStats[] = BUCKET_ORDER.map((bucket) => ({
      bucket,
      ...bucketMap.get(bucket)!,
    }))

    // Average wager size (all wagers, not just settled)
    const avgWagerSize =
      wagers.length > 0
        ? wagers.reduce((sum, w) => sum + w.amount, 0) / wagers.length
        : 0

    // Streak — walk settled wagers newest first
    const ordered = [...settled].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    let current = 0
    let longest = 0
    let streakType: 'win' | 'loss' | null = null

    for (const w of ordered) {
      const won = (w.payout ?? 0) > w.amount
      const kind: 'win' | 'loss' = won ? 'win' : 'loss'

      if (streakType === null) {
        streakType = kind
        current = 1
        longest = 1
      } else if (kind === streakType) {
        current += 1
        if (current > longest) longest = current
      } else {
        break
      }
    }

    return {
      roiByLine,
      winRateByTimeOfDay,
      avgWagerSize,
      streak: { current, longest, type: streakType },
    }
  }, [wagers])
}
