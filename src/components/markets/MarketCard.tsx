import { useState } from 'react'
import { Link } from 'react-router-dom'
import LineBadge from '../mta/LineBadge'
import { formatTime, getDelayMinutes } from '../../lib/mta'
import type { Database } from '../../types/database'

type Market = Database['public']['Tables']['markets']['Row']

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
}

interface Props {
  market: Market
  isFavorite?: boolean
  onToggleFavorite?: (stopId: string) => Promise<Error | undefined>
}

export default function MarketCard({ market, isFavorite = false, onToggleFavorite }: Props) {
  const [toggleError, setToggleError] = useState(false)

  const delay = market.latest_predicted_arrival
    ? getDelayMinutes(market.scheduled_arrival, market.latest_predicted_arrival)
    : null

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!onToggleFavorite) return
    const err = await onToggleFavorite(market.stop_id)
    if (err) {
      setToggleError(true)
      setTimeout(() => setToggleError(false), 2000)
    }
  }

  return (
    <Link
      to={`/market/${market.id}`}
      className="card block px-4 py-3 hover:bg-sp-panel2 transition-colors"
    >
      <div className="flex items-center gap-3">
        <LineBadge line={market.route_id} />

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{market.stop_name}</div>
          <div className="text-[11px] text-sp-dim mt-0.5 uppercase tracking-wide">
            {market.route_id} train&ensp;·&ensp;{market.trip_id.slice(-6)}
          </div>
        </div>

        <div className="hidden xs:flex shrink-0 gap-1">
          <OddsPill value={market.on_time_odds} color="text-sp-on" border="border-sp-on/35" />
          <OddsPill value={market.late_odds} color="text-sp-late" border="border-sp-late/35" />
          <OddsPill value={market.very_late_odds} color="text-sp-very" border="border-sp-very/35" />
        </div>

        <div className="text-right shrink-0">
          <div className="text-sm font-bold tabular-nums text-sp-led">
            {formatTime(market.scheduled_arrival)}
          </div>
          {delay !== null && delay > 0 && (
            <div className="text-xs text-sp-very font-medium tabular-nums">
              +{delay} min
            </div>
          )}
          {delay !== null && delay <= 0 && (
            <div className="text-xs text-sp-on font-medium">on time</div>
          )}
          {delay === null && (
            <div className="text-xs text-sp-dim">&mdash;</div>
          )}
        </div>

        {onToggleFavorite && (
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`shrink-0 transition-colors ${
              toggleError
                ? 'text-sp-very'
                : isFavorite
                  ? 'text-sp-led'
                  : 'text-sp-dim hover:text-sp-led'
            }`}
            aria-label={isFavorite ? 'Unfavorite station' : 'Favorite station'}
          >
            <StarIcon filled={isFavorite} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-sp-edge">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${
            market.status === 'open' ? 'text-sp-on' : 'text-sp-dim'
          }`}
        >
          {market.status}
        </span>
        {market.latest_predicted_arrival && (
          <span className="text-[10px] text-sp-dim tabular-nums">
            ETA {formatTime(market.latest_predicted_arrival)}
          </span>
        )}
      </div>
    </Link>
  )
}

function OddsPill({
  value,
  color,
  border,
}: {
  value: number | null | undefined
  color: string
  border: string
}) {
  return (
    <span className={`min-w-[46px] text-center py-1 border text-[11px] font-bold tabular-nums ${color} ${border}`}>
      {typeof value === 'number' ? `${value.toFixed(2)}×` : '—'}
    </span>
  )
}
