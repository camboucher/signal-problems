import { Link } from 'react-router-dom'
import LineBadge from '../mta/LineBadge'
import { formatTime } from '../../lib/mta'
import type { WagerWithMarket } from '../../hooks/use-profile'

interface Props {
  readonly wagers: WagerWithMarket[]
  readonly isLoading: boolean
  readonly emptyMessage?: string
}

interface PayoutDisplayProps {
  readonly wager: WagerWithMarket
}

function PayoutDisplay({ wager }: PayoutDisplayProps) {
  const { payout, amount, markets } = wager

  if (payout === null) {
    const statusColor =
      markets.status === 'open'
        ? 'text-emerald-500'
        : markets.status === 'closed'
          ? 'text-amber-500'
          : 'text-gray-400'
    return (
      <>
        <div className="text-xs tabular-nums text-gray-600">{amount.toLocaleString()}</div>
        <div className={`text-[10px] font-bold uppercase tracking-wide ${statusColor}`}>
          {markets.status}
        </div>
      </>
    )
  }

  const isRefund = payout === amount
  const isWin = payout > 0 && !isRefund
  const netChange = isWin ? payout - amount : amount

  const valueColor = isWin ? 'text-emerald-600' : isRefund ? 'text-gray-400' : 'text-red-500'
  const valueText = isWin
    ? `+${netChange.toLocaleString()}`
    : isRefund
      ? '±0'
      : `-${netChange.toLocaleString()}`
  const statusLabel = isWin ? 'Won' : isRefund ? 'Refund' : 'Lost'

  return (
    <>
      <div className={`text-xs font-bold tabular-nums ${valueColor}`}>{valueText}</div>
      <div className="text-[10px] uppercase tracking-wide text-gray-400">{statusLabel}</div>
    </>
  )
}

export default function WagerHistory({ wagers, isLoading, emptyMessage = 'No wagers yet' }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-px">
        {Array.from({ length: 5 }).map((_, i) => (
          // Skeleton rows — index key is stable for static placeholder list
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className="card px-4 py-3 flex items-center gap-3 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-gray-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 w-3/4" />
              <div className="h-2 bg-gray-100 w-1/2" />
            </div>
            <div className="w-12 h-3 bg-gray-100 shrink-0" />
          </div>
        ))}
      </div>
    )
  }

  if (wagers.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-10 border border-dashed border-gray-200">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="card divide-y divide-gray-100">
      {wagers.map((w) => (
        <Link
          key={w.id}
          to={`/market/${w.market_id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <LineBadge line={w.markets.route_id} size="sm" />

          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{w.markets.stop_name}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {formatTime(w.markets.scheduled_arrival)}
              &ensp;·&ensp;
              <span className={w.prediction === 'on_time' ? 'text-emerald-500' : 'text-red-500'}>
                {w.prediction === 'on_time' ? 'On Time' : 'Late'}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <PayoutDisplay wager={w} />
          </div>
        </Link>
      ))}
    </div>
  )
}
