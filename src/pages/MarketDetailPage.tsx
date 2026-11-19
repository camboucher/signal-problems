import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { useMarketDetail } from '../hooks/use-market-detail'
import LineBadge from '../components/mta/LineBadge'
import DistributionBar from '../components/markets/DistributionBar'
import OddsExplainer from '../components/markets/OddsExplainer'
import WagerModal from '../components/markets/WagerModal'
import { formatTime, getDelayMinutes } from '../lib/mta'
import { LiveDot, SectionLabel } from '../components/signage/Signage'
import type { WagerPrediction } from '../types/database'

const PICK_LABEL: Record<WagerPrediction, string> = {
  on_time: 'On time',
  late: 'Late',
  very_late: 'Very late',
}

const PICK_COLOR: Record<WagerPrediction, string> = {
  on_time: 'text-sp-on',
  late: 'text-sp-late',
  very_late: 'text-sp-very',
}

export default function MarketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile, refreshProfile } = useAuth()
  const { market, wagers, stopStats } = useMarketDetail(id)
  const [wagerOpen, setWagerOpen] = useState(false)

  if (market.isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2.5 text-sm text-sp-dim py-16">
          <LiveDot tone="led" />
          Loading…
        </div>
      </div>
    )
  }

  if (market.error || !market.data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="text-sm text-sp-dim hover:text-sp-accent">
          ← All trains
        </Link>
        <div className="empty-state mt-4">
          We couldn't find that train. It may have already left the station.
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

  // The ticket box below is a fixed dark "signage" surface (like Navbar), so
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
        ← All trains
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3.5 mt-4">
        <LineBadge line={m.route_id} size="lg" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-sp-dim">
            {m.route_id} train&ensp;·&ensp;Trip {m.trip_id.slice(-6)}
          </p>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight leading-tight truncate">
            {m.stop_name}
          </h1>
        </div>
      </div>

      {/* Ticket: scheduled / predicted / status, on a fixed dark signage surface */}
      <div className="mt-5 border border-[#ffb800]/30 bg-[#0c0d12] divide-y divide-[#ffb800]/20 shadow-xl">
        <div className="flex items-center gap-2.5 px-4 py-2.5">
          {m.status === 'open' ? <LiveDot tone="led" /> : <span className="w-2 h-2 rounded-full bg-[#8b8d9e]/50" />}
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#ffb800]">
            Arrival board
          </span>
        </div>
        <Row label="Scheduled" ticket>
          <span className="text-sm font-bold tabular-nums text-[#e9e9ed]">
            {formatTime(m.scheduled_arrival)}
          </span>
        </Row>

        {m.latest_predicted_arrival && (
          <Row label="Predicted" ticket>
            <span
              key={m.latest_predicted_arrival}
              className="inline-block animate-sp-flip text-sm tabular-nums text-[#ffb800]"
            >
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
              {PICK_LABEL[m.outcome]}
            </span>
          </Row>
        )}
      </div>

      {/* Stop stats */}
      {stopStats.data && (
        <div className="card mt-3 px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-sp-dim">
            How often this train is on time here
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

      {/* Odds explainer */}
      <OddsExplainer market={m} stopStats={stopStats.data} />

      {/* Distribution bar */}
      <div className="mt-5">
        <SectionLabel>What everyone's calling</SectionLabel>
        <DistributionBar onTimeAmount={onTimeAmount} lateAmount={lateAmount} veryLateAmount={veryLateAmount} />
      </div>

      {/* Wager action */}
      <div className="mt-5">
        {m.status === 'open' && user && !userWager && (
          <button
            onClick={() => setWagerOpen(true)}
            className="btn-primary w-full py-3 animate-sp-glow"
          >
            Make your call
          </button>
        )}

        {m.status === 'open' && !user && (
          <Link to="/login" className="btn-primary w-full py-3 text-center">
            Sign in to make a call
          </Link>
        )}

        {userWager && (
          <div className="card px-4 py-3">
            <SectionLabel className="mb-1.5">Your call</SectionLabel>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-bold uppercase tracking-wide ${PICK_COLOR[userWager.prediction]}`}>
                {PICK_LABEL[userWager.prediction]}
              </span>
              <span className="text-sm font-bold tabular-nums">
                {userWager.amount.toLocaleString()} credits
              </span>
            </div>
            {userWager.payout !== null && (
              <p className="text-xs text-sp-dim mt-1">
                {userWager.payout > 0
                  ? `You got back ${userWager.payout.toLocaleString()} credits.`
                  : 'Not this time. Better luck on the next one.'}
              </p>
            )}
          </div>
        )}

        {m.status === 'closed' && !userWager && (
          <p className="empty-state py-5">
            The doors have closed on this one. Pick another train to play.
          </p>
        )}

        {m.status === 'cancelled' && (
          <p className="empty-state py-5">
            This train was cancelled, so everyone got their credits back.
          </p>
        )}
      </div>

      {/* Recent wagers list */}
      {wagers.data && wagers.data.length > 0 && (
        <div className="mt-6">
          <SectionLabel>Recent calls</SectionLabel>
          <div className="card divide-y divide-sp-edge">
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
                    <span className="text-sm text-sp-dim">Someone</span>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${PICK_COLOR[w.prediction]}`}>
                    {PICK_LABEL[w.prediction]}
                  </span>
                </div>
                <span className="text-xs text-sp-dim tabular-nums">
                  {w.amount.toLocaleString()} cr
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
