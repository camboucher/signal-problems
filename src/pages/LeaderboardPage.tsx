import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLeaderboard, type TimePeriod } from '../hooks/use-leaderboard'
import { PageHeader } from '../components/signage/Signage'

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
      <PageHeader
        kicker="Best calls"
        title="Leaderboard"
        right={
          <div className="seg">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`seg-btn ${period === p.value ? 'seg-btn-active' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {isLoading && (
        <div className="space-y-px">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card px-4 py-3 flex items-center gap-4 animate-pulse">
              <div className="w-6 h-3 bg-sp-panel2 shrink-0" />
              <div className="flex-1 h-3 bg-sp-panel2" />
              <div className="w-16 h-3 bg-sp-panel2 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="empty-state text-sp-very border-sp-very/30">
          We couldn't load the leaderboard. Try again in a moment.
        </div>
      )}

      {!isLoading && !error && data?.length === 0 && (
        <div className="empty-state">
          Nobody's on the board for this stretch yet. Could be you.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="card divide-y divide-sp-edge">
          {data.map((entry, i) => {
            const rankColor =
              i === 0 ? 'text-sp-led' : i <= 2 ? 'text-sp-text' : 'text-sp-dim'
            return (
            <Link
              key={entry.user_id}
              to={`/profile/${entry.username}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-sp-panel2 transition-colors"
            >
              <span className={`text-sm font-bold tabular-nums w-5 text-right shrink-0 ${rankColor}`}>
                {i + 1}
              </span>
              <span className="text-sm font-medium flex-1 truncate">
                {entry.username}
                {i === 0 && (
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-sp-led">
                    Top of the line
                  </span>
                )}
              </span>
              <div className="text-right shrink-0">
                <div
                  className={`text-sm font-bold tabular-nums ${
                    entry.net_profit >= 0 ? 'text-sp-on' : 'text-sp-very'
                  }`}
                >
                  {entry.net_profit >= 0 ? '+' : ''}
                  {entry.net_profit.toLocaleString()}
                </div>
                <div className="text-[10px] text-sp-dim tabular-nums">
                  {entry.wager_count} call{entry.wager_count !== 1 ? 's' : ''}
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
