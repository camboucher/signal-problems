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
  const veryLateAmount =
    wagers.data
      ?.filter((w) => w.prediction === 'very_late')
      .reduce((sum, w) => sum + w.amount, 0) ?? 0

  const userWager = wagers.data?.find((w) => w.user_id === user?.id)

  function handleWagerSuccess() {
    wagers.refetch()
    refreshProfile()
  }

  // The ticket box below is a fixed dark "signage" surface (like Navbar) —
  // these colors are hardcoded rather than pulled from the theme-reactive
  // sp-* tokens, which would go dark-on-dark in light theme.
  const statusColor: Record<string, string> = {
    open: 'text-[#3ad07e]',
    closed: 'text-[#ffb020]',
    settled: 'text-[#8b8d9e]',
    cancelled: 'text-[#8b8d9e]',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/" className="text-sm text-sp-dim hover:text-sp-accent">
        ← Back to markets
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 mt-4">
        <LineBadge line={m.route_id} size="lg" />
        <div>
          <h1 className="text-lg font-bold tracking-tight">{m.stop_name}</h1>
          <p className="text-xs text-sp-dim mt-0.5 uppercase tracking-wide">
            {m.route_id} train&ensp;·&ensp;Trip {m.trip_id.slice(-6)}
          </p>
        </div>
      </div>

      {/* Ticket: scheduled / predicted / status — fixed dark signage surface */}
      <div className="mt-5 border border-[#ffb800]/30 bg-[#0c0d12] divide-y divide-[#ffb800]/20">
        <Row label="Scheduled" ticket>
          <span className="text-sm font-bold tabular-nums text-[#e9e9ed]">
            {formatTime(m.scheduled_arrival)}
          </span>
        </Row>

        {m.latest_predicted_arrival && (
          <Row label="Predicted" ticket>
            <span className="text-sm tabular-nums text-[#ffb800]">
              {formatTime(m.latest_predicted_arrival)}
              {delay !== null && delay > 0 && (
                <span className="text-[#ff5247] font-medium ml-2">
                  +{delay} min
                </span>
              )}
              {delay !== null && delay <= 0 && (
                <span className="text-[#3ad07e] font-medium ml-2">
                  on time
                </span>
              )}
            </span>
          </Row>
        )}

        {m.actual_arrival && (
          <Row label="Actual" ticket>
            <span className="text-sm font-bold tabular-nums text-[#e9e9ed]">
              {formatTime(m.actual_arrival)}
            </span>
          </Row>
        )}

        <Row label="Status" ticket>
          <span
            className={`text-xs font-bold uppercase tracking-wider ${statusColor[m.status] ?? 'text-sp-dim'}`}
          >
            {m.status}
          </span>
        </Row>

        {m.outcome && (
          <Row label="Outcome" ticket>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                m.outcome === 'on_time'
                  ? 'text-[#3ad07e]'
                  : m.outcome === 'very_late'
                  ? 'text-[#ff5247]'
                  : 'text-[#ffb020]'
              }`}
            >
              {m.outcome === 'on_time' ? 'On Time' : m.outcome === 'very_late' ? 'Very Late' : 'Late'}
            </span>
          </Row>
        )}
      </div>

      {/* Stop stats */}
      {stopStats.data && (
        <div className="card mt-3 px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-sp-dim uppercase tracking-wide">
            Historical on-time rate
          </span>
          <div className="text-right">
            <span className="text-sm font-bold tabular-nums">
              {Math.round(stopStats.data.on_time_rate * 100)}%
            </span>
            <span className="text-xs text-sp-dim ml-1">
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
        <DistributionBar onTimeAmount={onTimeAmount} lateAmount={lateAmount} veryLateAmount={veryLateAmount} />
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
                    ? 'text-sp-on'
                    : userWager.prediction === 'very_late'
                    ? 'text-sp-very'
                    : 'text-sp-late'
                }`}
              >
                {userWager.prediction === 'on_time'
                  ? 'On Time'
                  : userWager.prediction === 'very_late'
                  ? 'Very Late'
                  : 'Late'}
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
                  {w.profiles?.username ? (
                    <Link
                      to={`/profile/${w.profiles.username}`}
                      className="text-sm hover:underline"
                    >
                      {w.profiles.username}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">Anon</span>
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      w.prediction === 'on_time'
                        ? 'text-sp-on'
                        : w.prediction === 'very_late'
                        ? 'text-sp-very'
                        : 'text-sp-late'
                    }`}
                  >
                    {w.prediction === 'on_time'
                      ? 'On Time'
                      : w.prediction === 'very_late'
                      ? 'Very Late'
                      : 'Late'}
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
  ticket = false,
}: {
  label: string
  children: React.ReactNode
  ticket?: boolean
}) {
  return (
    <div className={ticket ? 'flex justify-between items-center px-4 py-3' : 'flex justify-between items-center px-4 py-2.5'}>
      <span
        className={
          ticket
            ? 'text-[10px] font-bold uppercase tracking-widest text-[#ffb800]/70'
            : 'text-xs text-sp-dim uppercase tracking-wide'
        }
      >
        {label}
      </span>
      {children}
    </div>
  )
}
