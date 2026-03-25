import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { useMarketDetail } from '../hooks/use-market-detail'
import LineBadge from '../components/mta/LineBadge'
import DistributionBar from '../components/markets/DistributionBar'
import WagerModal from '../components/markets/WagerModal'
import { formatTime, getDelayMinutes } from '../lib/mta'

export default function MarketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile, refreshProfile } = useAuth()
  const { market, wagers, stopStats } = useMarketDetail(id)
  const [wagerOpen, setWagerOpen] = useState(false)

  if (market.isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-sm text-gray-400 text-center py-16">Loading…</div>
      </div>
    )
  }

  if (market.error || !market.data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← Back to markets
        </Link>
        <div className="text-sm text-red-500 text-center py-16 mt-4">
          Market not found
        </div>
      </div>
    )
  }

  const m = market.data
  const delay = m.latest_predicted_arrival
    ? getDelayMinutes(m.scheduled_arrival, m.latest_predicted_arrival)
    : null

  const onTimeAmount =
    wagers.data
      ?.filter((w) => w.prediction === 'on_time')
      .reduce((sum, w) => sum + w.amount, 0) ?? 0
  const lateAmount =
    wagers.data
      ?.filter((w) => w.prediction === 'late')
      .reduce((sum, w) => sum + w.amount, 0) ?? 0

  const userWager = wagers.data?.find((w) => w.user_id === user?.id)

  function handleWagerSuccess() {
    wagers.refetch()
    refreshProfile()
  }

  const statusColor: Record<string, string> = {
    open: 'text-emerald-500',
    closed: 'text-amber-500',
    settled: 'text-gray-500',
    cancelled: 'text-gray-400',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">
        ← Back to markets
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 mt-4">
        <LineBadge line={m.route_id} size="lg" />
        <div>
          <h1 className="text-lg font-bold tracking-tight">{m.stop_name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {m.route_id} train&ensp;·&ensp;Trip {m.trip_id.slice(-6)}
          </p>
        </div>
      </div>

      {/* Time info card */}
      <div className="card mt-5 divide-y divide-gray-100">
        <Row label="Scheduled">
          <span className="text-sm font-bold tabular-nums">
            {formatTime(m.scheduled_arrival)}
          </span>
        </Row>

        {m.latest_predicted_arrival && (
          <Row label="Predicted">
            <span className="text-sm tabular-nums">
              {formatTime(m.latest_predicted_arrival)}
              {delay !== null && delay > 0 && (
                <span className="text-red-500 font-medium ml-2">
                  +{delay} min
                </span>
              )}
              {delay !== null && delay <= 0 && (
                <span className="text-emerald-500 font-medium ml-2">
                  on time
                </span>
              )}
            </span>
          </Row>
        )}

        {m.actual_arrival && (
          <Row label="Actual">
            <span className="text-sm font-bold tabular-nums">
              {formatTime(m.actual_arrival)}
            </span>
          </Row>
        )}

        <Row label="Status">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${statusColor[m.status] ?? 'text-gray-400'}`}
          >
            {m.status}
          </span>
        </Row>

        {m.outcome && (
          <Row label="Outcome">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                m.outcome === 'on_time' ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {m.outcome === 'on_time' ? 'On Time' : 'Late'}
            </span>
          </Row>
        )}
      </div>

      {/* Stop stats */}
      {stopStats.data && (
        <div className="card mt-3 px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            Historical on-time rate
          </span>
          <div className="text-right">
            <span className="text-sm font-bold tabular-nums">
              {Math.round(stopStats.data.on_time_rate * 100)}%
            </span>
            <span className="text-xs text-gray-400 ml-1">
              ({stopStats.data.sample_count} trains)
            </span>
          </div>
        </div>
      )}

      {/* Distribution bar */}
      <div className="mt-5">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
          Wager Distribution
        </p>
        <DistributionBar onTimeAmount={onTimeAmount} lateAmount={lateAmount} />
      </div>

      {/* Wager action */}
      <div className="mt-5">
        {m.status === 'open' && user && !userWager && (
          <button
            onClick={() => setWagerOpen(true)}
            className="btn-primary w-full"
          >
            Place Wager
          </button>
        )}

        {m.status === 'open' && !user && (
          <Link to="/login" className="btn-primary w-full text-center block">
            Sign in to wager
          </Link>
        )}

        {userWager && (
          <div className="card px-4 py-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Your wager
            </p>
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-bold uppercase ${
                  userWager.prediction === 'on_time'
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                {userWager.prediction === 'on_time' ? 'On Time' : 'Late'}
              </span>
              <span className="text-sm font-bold tabular-nums">
                {userWager.amount.toLocaleString()} credits
              </span>
            </div>
            {userWager.payout !== null && (
              <p className="text-xs text-gray-400 mt-1">
                Payout: {userWager.payout.toLocaleString()} credits
              </p>
            )}
          </div>
        )}

        {m.status === 'closed' && !userWager && (
          <p className="text-sm text-gray-400 text-center py-4">
            Betting is closed for this market
          </p>
        )}

        {m.status === 'cancelled' && (
          <p className="text-sm text-gray-400 text-center py-4">
            This market was cancelled — all wagers refunded
          </p>
        )}
      </div>

      {/* Recent wagers list */}
      {wagers.data && wagers.data.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
            Recent Wagers
          </p>
          <div className="card divide-y divide-gray-100">
            {wagers.data.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {w.profiles?.username ?? 'Anon'}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      w.prediction === 'on_time'
                        ? 'text-emerald-500'
                        : 'text-red-500'
                    }`}
                  >
                    {w.prediction === 'on_time' ? 'On Time' : 'Late'}
                  </span>
                </div>
                <span className="text-xs text-gray-400 tabular-nums">
                  {w.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wager modal */}
      <WagerModal
        market={m}
        profile={profile}
        userId={user?.id ?? null}
        open={wagerOpen}
        onOpenChange={setWagerOpen}
        onSuccess={handleWagerSuccess}
      />
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5">
      <span className="text-xs text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      {children}
    </div>
  )
}
