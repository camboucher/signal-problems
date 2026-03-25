import { Link } from 'react-router-dom'
import LineBadge from '../mta/LineBadge'
import { formatTime, getDelayMinutes } from '../../lib/mta'
import type { Database } from '../../types/database'

type Market = Database['public']['Tables']['markets']['Row']

export default function MarketCard({ market }: { market: Market }) {
  const delay = market.latest_predicted_arrival
    ? getDelayMinutes(market.scheduled_arrival, market.latest_predicted_arrival)
    : null

  return (
    <Link
      to={`/market/${market.id}`}
      className="card block px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <LineBadge line={market.route_id} />

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{market.stop_name}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {market.route_id} train&ensp;·&ensp;{market.trip_id.slice(-6)}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-sm font-bold tabular-nums">
            {formatTime(market.scheduled_arrival)}
          </div>
          {delay !== null && delay > 0 && (
            <div className="text-xs text-red-500 font-medium tabular-nums">
              +{delay} min
            </div>
          )}
          {delay !== null && delay <= 0 && (
            <div className="text-xs text-emerald-500 font-medium">on time</div>
          )}
          {delay === null && (
            <div className="text-xs text-gray-300">&mdash;</div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${
            market.status === 'open' ? 'text-emerald-500' : 'text-gray-400'
          }`}
        >
          {market.status}
        </span>
        {market.latest_predicted_arrival && (
          <span className="text-[10px] text-gray-400 tabular-nums">
            ETA {formatTime(market.latest_predicted_arrival)}
          </span>
        )}
      </div>
    </Link>
  )
}
