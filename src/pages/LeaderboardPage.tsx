import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLeaderboard, type TimePeriod } from '../hooks/use-leaderboard'

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: 'all', label: 'ALL' },
]

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<TimePeriod>('7d')
  const { data, isLoading, error } = useLeaderboard(period)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold tracking-tight">Leaderboard</h1>
        <div className="flex border border-gray-200">
          {PERIODS.map((p, i) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-xs font-bold tracking-wider transition-colors ${
                i > 0 ? 'border-l border-gray-200' : ''
              } ${
                period === p.value
                  ? 'bg-gray-950 text-white'
                  : 'bg-white text-gray-500 hover:text-gray-950'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-px">
          {Array.from({ length: 8 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i} className="card px-4 py-3 flex items-center gap-4 animate-pulse">
              <div className="w-6 h-3 bg-gray-100 shrink-0" />
              <div className="flex-1 h-3 bg-gray-100" />
              <div className="w-16 h-3 bg-gray-100 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-sm text-sp-very text-center py-16 border border-dashed border-sp-very/30">
          Failed to load leaderboard
        </div>
      )}

      {!isLoading && !error && data?.length === 0 && (
        <div className="text-sm text-gray-400 text-center py-16 border border-dashed border-gray-200">
          No settled wagers in this period yet
        </div>
      )}

      {data && data.length > 0 && (
        <div className="card divide-y divide-gray-100">
          {data.map((entry, i) => {
            const rankColor =
              i === 0 ? 'text-sp-led' : i <= 2 ? 'text-sp-text' : 'text-sp-dim'
            return (
            <Link
              key={entry.user_id}
              to={`/profile/${entry.username}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className={`text-sm font-bold tabular-nums w-5 text-right shrink-0 ${rankColor}`}>
                {i + 1}
              </span>
              <span className="text-sm font-medium flex-1 truncate">{entry.username}</span>
              <div className="text-right shrink-0">
                <div
                  className={`text-sm font-bold tabular-nums ${
                    entry.net_profit >= 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {entry.net_profit >= 0 ? '+' : ''}
                  {entry.net_profit.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 tabular-nums">
                  {entry.wager_count} wager{entry.wager_count !== 1 ? 's' : ''}
                </div>
              </div>
            </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
