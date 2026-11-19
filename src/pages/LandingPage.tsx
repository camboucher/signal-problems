import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import LineBadge from '../components/mta/LineBadge'
import { LiveDot, SignLogo, Ticker } from '../components/signage/Signage'
import { SERVICE_NOTICES } from '../lib/service-notices'
import { useMarkets } from '../hooks/use-markets'
import { formatTime, getDelayMinutes, FILTER_LINES } from '../lib/mta'
import { markLandingSeen } from '../lib/ftue'
import type { Database } from '../types/database'

type Market = Database['public']['Tables']['markets']['Row']

const STEPS = [
  {
    n: '1',
    title: 'Pick a train',
    body: 'Find your station, or any train headed somewhere soon.',
  },
  {
    n: '2',
    title: 'Make your call',
    body: 'On time, late, or very late. Put some play credits on it.',
  },
  {
    n: '3',
    title: 'See if you were right',
    body: 'Once the train pulls in, we check the arrival and pay out.',
  },
]

const CALLS = [
  {
    accent: 'bg-[#3ad07e]',
    text: 'text-[#3ad07e]',
    title: 'On time',
    range: 'Within 5 minutes of schedule',
    body: 'The safe pick. It happens a lot, so it pays a little.',
  },
  {
    accent: 'bg-[#ffb020]',
    text: 'text-[#ffb020]',
    title: 'Late',
    range: '5 to 20 minutes behind',
    body: 'You know the feeling. A middle-of-the-road payout.',
  },
  {
    accent: 'bg-[#ff5247]',
    text: 'text-[#ff5247]',
    title: 'Very late',
    range: 'Over 20 minutes behind',
    body: 'The long shot. Rare, so it pays the most when it hits.',
  },
]

const CTA_PRIMARY =
  'text-[11px] font-bold uppercase tracking-widest border border-[#9184d9] text-[#9184d9] hover:bg-[#9184d9]/10 transition-colors'
const CTA_SECONDARY =
  'text-[11px] font-bold uppercase tracking-widest border border-[#e9e9ed]/15 text-[#e9e9ed] hover:border-[#e9e9ed]/40 transition-colors'

function DepartureRow({ market }: { readonly market: Market }) {
  const delay = market.latest_predicted_arrival
    ? getDelayMinutes(market.scheduled_arrival, market.latest_predicted_arrival)
    : null

  return (
    <Link
      to={`/market/${market.id}`}
      className="flex items-center gap-3 px-4 py-2.5 border-b border-[#ffb800]/10 last:border-b-0 hover:bg-[#ffb800]/[0.04] transition-colors"
    >
      <LineBadge line={market.route_id} size="sm" />
      <span className="flex-1 min-w-0 truncate text-sm text-[#e9e9ed]">{market.stop_name}</span>
      <span className="text-right shrink-0">
        <span className="block text-sm font-bold tabular-nums text-[#ffb800]">
          {formatTime(market.scheduled_arrival)}
        </span>
        {delay !== null && (
          <span className={`block text-[10px] font-medium ${delay > 0 ? 'text-[#ff5247]' : 'text-[#3ad07e]'}`}>
            {delay > 0 ? `+${delay} min` : 'on time'}
          </span>
        )}
      </span>
    </Link>
  )
}

export default function LandingPage() {
  const { data: markets } = useMarkets()
  const preview = (markets ?? []).slice(0, 6)

  useEffect(() => {
    markLandingSeen()
  }, [])

  return (
    <div className="min-h-screen bg-[#0c0d12]">
      <div className="flex items-center gap-3.5 px-5 sm:px-8 h-16 border-b-[3px] border-[#ffb800]">
        <SignLogo size="lg" />
        <div className="flex-1" />
        <Link to="/about" className="hidden sm:inline text-sm font-medium text-[#8b8d9e] hover:text-[#e9e9ed]">
          How it works
        </Link>
        <Link to="/login" className="text-sm font-medium text-[#8b8d9e] hover:text-[#e9e9ed]">
          Sign in
        </Link>
      </div>

      {/* Hero */}
      <div className="px-5 sm:px-8 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-12 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-2.5 mb-5">
              <LiveDot />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8b8d9e]">
                Real trains, running now
              </span>
            </div>
            <h1 className="text-[2.5rem] sm:text-6xl lg:text-7xl leading-[0.98] tracking-tight font-medium text-[#e9e9ed] text-balance">
              Your train is late.
              <br />
              <span className="text-[#ffb800]">Guess how late.</span>
            </h1>
            <p className="mt-6 max-w-[42ch] text-[17px] leading-relaxed text-[#a5a7b6]">
              Signal Problems is a little game for the platform. Pick a train that's on its way and
              guess when it'll really show up. Then see if you called it.
            </p>
            <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-[#8b8d9e]">
              Everyone starts with 1,000 play credits. Nothing real is at stake.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-8">
              <Link to="/signup" className={`${CTA_PRIMARY} px-6 py-4 animate-sp-glow`}>
                Start playing
              </Link>
              <Link to="/" className={`${CTA_SECONDARY} px-6 py-4`}>
                Look around first
              </Link>
            </div>
            <div className="flex gap-1.5 mt-10 flex-wrap">
              {FILTER_LINES.map((line) => (
                <LineBadge key={line} line={line} size="sm" />
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[300px]">
            <div className="border border-[#ffb800]/30 bg-[#0a0b0f] shadow-2xl">
              <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[#ffb800]/25">
                <LiveDot tone="led" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#ffb800]">
                  Next departures
                </span>
              </div>
              {preview.length > 0 ? (
                <div>
                  {preview.map((m) => (
                    <DepartureRow key={m.id} market={m} />
                  ))}
                </div>
              ) : (
                <p className="px-4 py-8 text-center text-sm text-[#8b8d9e]">
                  The board is quiet right now. Check back in a minute.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Ticker items={SERVICE_NOTICES} className="border-t py-2.5" />

      {/* How to play */}
      <div className="bg-[#262a60] px-5 sm:px-8 py-14">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#e9e9ed]/60 mb-8">
            How to play
          </p>
          <ol className="grid gap-10 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="w-9 h-9 rounded-full border-2 border-[#ffb800] text-[#ffb800] inline-flex items-center justify-center text-sm font-bold shrink-0">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-xl font-medium tracking-tight text-[#e9e9ed]">{s.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[#e9e9ed]/70">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* The three calls */}
      <div className="px-5 sm:px-8 py-16 sm:py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#e9e9ed]">
          Three ways to call it
        </h2>
        <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-[#8b8d9e]">
          Each station has its own track record, so the payouts change from train to train. A stop
          that's always running behind won't pay much for "late."
        </p>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {CALLS.map((c) => (
            <div key={c.title}>
              <span className={`block w-9 h-[3px] mb-4 ${c.accent}`} />
              <h3 className={`text-xl font-medium tracking-tight ${c.text}`}>{c.title}</h3>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-[#8b8d9e]">
                {c.range}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-[#a5a7b6]">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-5 sm:px-8 py-16 sm:py-24 text-center border-t border-[#ffb800]/15">
        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#e9e9ed] text-balance">
          Got a few minutes on the platform?
        </h2>
        <p className="mt-4 text-[15px] text-[#8b8d9e]">That's plenty of time for a round.</p>
        <div className="flex flex-wrap gap-2.5 justify-center mt-8">
          <Link to="/signup" className={`${CTA_PRIMARY} px-8 py-4`}>
            Start playing
          </Link>
          <Link to="/" className={`${CTA_SECONDARY} px-8 py-4`}>
            Look around first
          </Link>
        </div>
        <p className="mt-8 text-xs text-[#6b6d7a]">
          A fan project, made for fun. Not affiliated with the MTA.
        </p>
      </div>
    </div>
  )
}
