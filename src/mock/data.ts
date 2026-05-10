import type {
  Database,
  MarketOutcome,
  MarketStatus,
  WagerPrediction,
} from '../types/database'

type Market = Database['public']['Tables']['markets']['Row']
type Wager = Database['public']['Tables']['wagers']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type StopStat = Database['public']['Tables']['stop_stats']['Row']

export const MOCK_USER_ID = '00000000-0000-4000-8000-000000000001'

const OTHER_USER_IDS = {
  transitqueen: '00000000-0000-4000-8000-000000000002',
  localrider: '00000000-0000-4000-8000-000000000003',
  delayhunter: '00000000-0000-4000-8000-000000000004',
  expressbet: '00000000-0000-4000-8000-000000000005',
} as const

/** Base market ids (times refreshed per fetch via `buildMockMarkets`). */
const MARKET_IDS = [
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000006',
] as const

function baseCreatedAt(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString()
}

/** Markets with scheduled times in the same window as the real `useMarkets` query. */
export function buildMockMarkets(): Market[] {
  const now = Date.now()
  const schedules = [
    { m: 12, route: 'A', stop: 'H01', name: 'High St', trip: 'mock-trip-a1' },
    { m: 22, route: 'C', stop: 'A36', name: 'Canal St', trip: 'mock-trip-c1' },
    { m: 35, route: '1', stop: '120', name: 'Times Sq', trip: 'mock-trip-11' },
    { m: 48, route: 'L', stop: 'L06', name: 'Bedford Av', trip: 'mock-trip-l1' },
    { m: 72, route: 'N', stop: 'R20', name: 'Union Sq', trip: 'mock-trip-n1' },
    { m: 95, route: '6', stop: '631', name: 'Grand Central', trip: 'mock-trip-61' },
  ] as const

  return schedules.map((s, i) => {
    const scheduled = new Date(now + s.m * 60_000).toISOString()
    const predicted = new Date(now + (s.m + (i % 3) - 1) * 60_000).toISOString()
    // Vary odds per market to make mock mode illustrative
    const onTimeRate = 0.55 + (i * 0.07)
    const pLateTotal = 1 - onTimeRate
    const vig = 0.05
    const clamp = (x: number) => Math.max(1.1, Math.min(15.0, x))
    return {
      id: MARKET_IDS[i]!,
      trip_id: s.trip,
      route_id: s.route,
      stop_id: s.stop,
      stop_name: s.name,
      scheduled_arrival: scheduled,
      latest_predicted_arrival: predicted,
      status: 'open' as const,
      outcome: null,
      actual_arrival: null,
      on_time_odds: Math.round(clamp((1 / onTimeRate) * (1 - vig)) * 100) / 100,
      late_odds: Math.round(clamp((1 / (pLateTotal * 0.75)) * (1 - vig)) * 100) / 100,
      very_late_odds: Math.round(clamp((1 / (pLateTotal * 0.25)) * (1 - vig)) * 100) / 100,
      created_at: baseCreatedAt(),
      updated_at: new Date(now).toISOString(),
    }
  })
}

let mockCreditsBalance = 1000

const mockListeners = new Set<() => void>()

export function subscribeMockUpdates(fn: () => void): () => void {
  mockListeners.add(fn)
  return () => {
    mockListeners.delete(fn)
  }
}

export function getMockCredits(): number {
  return mockCreditsBalance
}

function notifyMockListeners(): void {
  mockListeners.forEach((fn) => fn())
}

/** Initial profile for MockAuthProvider; balance and favorites are mutated in place. */
export const MOCK_PROFILE: Profile = {
  id: MOCK_USER_ID,
  username: 'mockuser',
  credits_balance: 1000,
  favorite_stop_ids: [],
  created_at: baseCreatedAt(),
  updated_at: new Date().toISOString(),
}

export function toggleMockFavorite(stopId: string): void {
  const ids = MOCK_PROFILE.favorite_stop_ids
  MOCK_PROFILE.favorite_stop_ids = ids.includes(stopId)
    ? ids.filter((id) => id !== stopId)
    : [...ids, stopId]
  notifyMockListeners()
}

function syncProfileBalance(): void {
  MOCK_PROFILE.credits_balance = mockCreditsBalance
}

function daysAgo(d: number, hour = 12): string {
  const t = new Date()
  t.setDate(t.getDate() - d)
  t.setHours(hour, 0, 0, 0)
  return t.toISOString()
}

const initialWagers: Wager[] = [
  // Other users (open wagers)
  {
    id: '20000000-0000-4000-8000-000000000001',
    user_id: OTHER_USER_IDS.transitqueen,
    market_id: MARKET_IDS[0]!,
    prediction: 'on_time',
    amount: 50,
    odds_accepted: 1.62,
    payout: null,
    created_at: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    user_id: OTHER_USER_IDS.localrider,
    market_id: MARKET_IDS[1]!,
    prediction: 'late',
    amount: 80,
    odds_accepted: 2.85,
    payout: null,
    created_at: new Date(Date.now() - 2_800_000).toISOString(),
  },
  {
    id: '20000000-0000-4000-8000-000000000004',
    user_id: OTHER_USER_IDS.delayhunter,
    market_id: MARKET_IDS[2]!,
    prediction: 'very_late',
    amount: 120,
    odds_accepted: 9.5,
    payout: null,
    created_at: new Date(Date.now() - 2_500_000).toISOString(),
  },
  // Mock user — open wager
  {
    id: '20000000-0000-4000-8000-000000000002',
    user_id: MOCK_USER_ID,
    market_id: MARKET_IDS[0]!,
    prediction: 'late',
    amount: 100,
    odds_accepted: 3.17,
    payout: null,
    created_at: new Date(Date.now() - 3_000_000).toISOString(),
  },
  // Mock user — settled wagers for analytics (A line)
  {
    id: '20000000-0000-4000-8000-000000000010',
    user_id: MOCK_USER_ID,
    market_id: MARKET_IDS[0]!,
    prediction: 'on_time',
    amount: 80,
    odds_accepted: 1.62,
    payout: 129,
    created_at: daysAgo(14, 8),
  },
  {
    id: '20000000-0000-4000-8000-000000000011',
    user_id: MOCK_USER_ID,
    market_id: MARKET_IDS[0]!,
    prediction: 'late',
    amount: 60,
    odds_accepted: 2.85,
    payout: 0,
    created_at: daysAgo(12, 9),
  },
  {
    id: '20000000-0000-4000-8000-000000000012',
    user_id: MOCK_USER_ID,
    market_id: MARKET_IDS[0]!,
    prediction: 'on_time',
    amount: 100,
    odds_accepted: 1.55,
    payout: 155,
    created_at: daysAgo(10, 7),
  },
  // Mock user — settled wagers (N line, afternoon)
  {
    id: '20000000-0000-4000-8000-000000000013',
    user_id: MOCK_USER_ID,
    market_id: MARKET_IDS[4]!,
    prediction: 'on_time',
    amount: 150,
    odds_accepted: 1.48,
    payout: 0,
    created_at: daysAgo(9, 14),
  },
  {
    id: '20000000-0000-4000-8000-000000000014',
    user_id: MOCK_USER_ID,
    market_id: MARKET_IDS[4]!,
    prediction: 'late',
    amount: 75,
    odds_accepted: 3.10,
    payout: 232,
    created_at: daysAgo(7, 15),
  },
  // Mock user — settled wagers (L line, evening)
  {
    id: '20000000-0000-4000-8000-000000000015',
    user_id: MOCK_USER_ID,
    market_id: MARKET_IDS[3]!,
    prediction: 'late',
    amount: 120,
    odds_accepted: 2.70,
    payout: 324,
    created_at: daysAgo(6, 19),
  },
  {
    id: '20000000-0000-4000-8000-000000000016',
    user_id: MOCK_USER_ID,
    market_id: MARKET_IDS[3]!,
    prediction: 'late',
    amount: 90,
    odds_accepted: 2.70,
    payout: 0,
    created_at: daysAgo(4, 20),
  },
  // Mock user — settled wagers (6 line, night)
  {
    id: '20000000-0000-4000-8000-000000000017',
    user_id: MOCK_USER_ID,
    market_id: MARKET_IDS[5]!,
    prediction: 'on_time',
    amount: 50,
    odds_accepted: 1.80,
    payout: 90,
    created_at: daysAgo(3, 23),
  },
  {
    id: '20000000-0000-4000-8000-000000000018',
    user_id: MOCK_USER_ID,
    market_id: MARKET_IDS[5]!,
    prediction: 'on_time',
    amount: 70,
    odds_accepted: 1.80,
    payout: 126,
    created_at: daysAgo(2, 22),
  },
  // Mock user — settled wagers (1 line, morning)
  {
    id: '20000000-0000-4000-8000-000000000019',
    user_id: MOCK_USER_ID,
    market_id: MARKET_IDS[2]!,
    prediction: 'late',
    amount: 200,
    odds_accepted: 4.20,
    payout: 0,
    created_at: daysAgo(1, 10),
  },
]

let mockWagers: Wager[] = [...initialWagers]

const usernameByUserId = new Map<string, string | null>([
  [MOCK_USER_ID, 'mockuser'],
  [OTHER_USER_IDS.transitqueen, 'transitqueen'],
  [OTHER_USER_IDS.localrider, 'localrider'],
  [OTHER_USER_IDS.delayhunter, 'delayhunter'],
  [OTHER_USER_IDS.expressbet, 'expressbet'],
])

const otherProfiles: Profile[] = [
  {
    id: OTHER_USER_IDS.transitqueen,
    username: 'transitqueen',
    credits_balance: 2450,
    favorite_stop_ids: [],
    created_at: baseCreatedAt(),
    updated_at: new Date().toISOString(),
  },
  {
    id: OTHER_USER_IDS.localrider,
    username: 'localrider',
    credits_balance: 890,
    favorite_stop_ids: [],
    created_at: baseCreatedAt(),
    updated_at: new Date().toISOString(),
  },
  {
    id: OTHER_USER_IDS.delayhunter,
    username: 'delayhunter',
    credits_balance: 3120,
    favorite_stop_ids: [],
    created_at: baseCreatedAt(),
    updated_at: new Date().toISOString(),
  },
  {
    id: OTHER_USER_IDS.expressbet,
    username: 'expressbet',
    credits_balance: 560,
    favorite_stop_ids: [],
    created_at: baseCreatedAt(),
    updated_at: new Date().toISOString(),
  },
]

export function getMockProfileByUsername(username: string): Pick<
  Profile,
  'id' | 'username' | 'credits_balance' | 'created_at'
> | null {
  if (username === MOCK_PROFILE.username) {
    return {
      id: MOCK_PROFILE.id,
      username: MOCK_PROFILE.username,
      credits_balance: mockCreditsBalance,
      created_at: MOCK_PROFILE.created_at,
    }
  }
  const p = otherProfiles.find((x) => x.username === username)
  return p
    ? {
        id: p.id,
        username: p.username,
        credits_balance: p.credits_balance,
        created_at: p.created_at,
      }
    : null
}

export function getMockWagersForUser(userId: string) {
  return mockWagers
    .filter((w) => w.user_id === userId)
    .map((w) => {
      const m = buildMockMarkets().find((mk) => mk.id === w.market_id)
      const route = m?.route_id ?? 'A'
      const stop = m?.stop_name ?? 'Unknown'
      const sched = w.created_at
      const settled = w.payout !== null
      const won = settled && (w.payout ?? 0) > w.amount
      const prediction = w.prediction as WagerPrediction
      const outcome: MarketOutcome | null = settled
        ? (won ? (prediction === 'on_time' ? 'on_time' : 'late') : (prediction === 'on_time' ? 'late' : 'on_time'))
        : null
      return {
        id: w.id,
        market_id: w.market_id,
        prediction,
        amount: w.amount,
        payout: w.payout,
        created_at: w.created_at,
        markets: {
          route_id: route,
          stop_name: stop,
          scheduled_arrival: sched,
          outcome,
          status: (settled ? 'settled' : 'open') as MarketStatus,
        },
      }
    })
}

const stopStatsByKey = new Map<string, StopStat>()

function ensureStopStats(): void {
  for (const m of buildMockMarkets()) {
    const key = `${m.stop_id}:${m.route_id}`
    if (!stopStatsByKey.has(key)) {
      const hash = m.stop_id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      stopStatsByKey.set(key, {
        id: `ss-${m.id}`,
        stop_id: m.stop_id,
        route_id: m.route_id,
        on_time_rate: 0.55 + (hash % 35) / 100,
        sample_count: 80 + (hash % 400),
        updated_at: new Date().toISOString(),
      })
    }
  }
}

export function getMockStopStats(stopId: string, routeId: string): StopStat | null {
  ensureStopStats()
  return stopStatsByKey.get(`${stopId}:${routeId}`) ?? null
}

export function getMockMarketById(id: string): Market | null {
  return buildMockMarkets().find((m) => m.id === id) ?? null
}

export function getMockWagersForMarket(marketId: string) {
  return mockWagers
    .filter((w) => w.market_id === marketId)
    .map((w) => ({
      ...w,
      profiles: { username: usernameByUserId.get(w.user_id) ?? null },
    }))
}

interface MarketsFilter {
  line?: string | null
  search?: string
  includeAll?: boolean
}

export function filterMockMarkets(filter: MarketsFilter): Market[] {
  let rows = buildMockMarkets()
  if (filter.line) {
    rows = rows.filter((m) => m.route_id === filter.line)
  }
  if (filter.search?.trim()) {
    const q = filter.search.trim().toLowerCase()
    rows = rows.filter((m) => m.stop_name.toLowerCase().includes(q))
  }
  return rows
}

export function applyMockWager(args: {
  marketId: string
  userId: string
  prediction: Database['public']['Tables']['wagers']['Row']['prediction']
  amount: number
  oddsAccepted: number
}): void {
  if (args.userId !== MOCK_USER_ID) return
  mockCreditsBalance -= args.amount
  syncProfileBalance()
  const row: Wager = {
    id: crypto.randomUUID(),
    user_id: args.userId,
    market_id: args.marketId,
    prediction: args.prediction,
    amount: args.amount,
    odds_accepted: args.oddsAccepted,
    payout: null,
    created_at: new Date().toISOString(),
  }
  mockWagers = [row, ...mockWagers]
  notifyMockListeners()
}

const BASE_LEADERBOARD = [
  {
    user_id: OTHER_USER_IDS.delayhunter,
    username: 'delayhunter',
    net_profit: 1840,
    total_wagered: 4200,
    wager_count: 28,
  },
  {
    user_id: OTHER_USER_IDS.transitqueen,
    username: 'transitqueen',
    net_profit: 920,
    total_wagered: 3100,
    wager_count: 19,
  },
  {
    user_id: MOCK_USER_ID,
    username: 'mockuser',
    net_profit: 340,
    total_wagered: 1800,
    wager_count: 12,
  },
  {
    user_id: OTHER_USER_IDS.localrider,
    username: 'localrider',
    net_profit: 210,
    total_wagered: 2400,
    wager_count: 22,
  },
  {
    user_id: OTHER_USER_IDS.expressbet,
    username: 'expressbet',
    net_profit: -120,
    total_wagered: 900,
    wager_count: 9,
  },
]

export function getMockLeaderboard(_period: '24h' | '7d' | '30d' | 'all') {
  return [...BASE_LEADERBOARD].sort((a, b) => b.net_profit - a.net_profit)
}
