import { Link } from 'react-router-dom'
import LineBadge from '../components/mta/LineBadge'
import { useMarkets } from '../hooks/use-markets'
import { formatTime, getDelayMinutes, FILTER_LINES } from '../lib/mta'
import { MTA_STATIONS } from '../lib/mta-stations'
import { enterDemoMode } from '../lib/mock-mode'
import type { Database } from '../types/database'

type Market = Database['public']['Tables']['markets']['Row']

const STATION_COUNT = Object.keys(MTA_STATIONS).length

const STATS = [
  { value: STATION_COUNT.toLocaleString(), label: 'Stations priced' },
  { value: '30s', label: 'Feed refresh' },
  { value: '3', label: 'Outcome tiers' },
  { value: '1,000', label: 'Starting credits' },
]

const FEATURES = [
  {
    accent: 'bg-[#3ad07e]',
    title: 'Three tiers, not a coin flip',
    body: "On time, late, very late — each priced separately, so calling a five-minute slip is a different bet from calling a meltdown.",
  },
  {
    accent: 'bg-[#9184d9]',
    title: 'Odds from that platform',
    body: 'Every market is priced off the historical on-time rate for that exact stop and route, plus a small vig, locked at creation.',
  },
  {
    accent: 'bg-[#ffb800]',
    title: 'Settled by the MTA',
    body: 'Markets resolve against the real arrival in the GTFS-Realtime feed. No oracle, no judgment call, no argument.',
  },
]

const MARQUEE =
  'THREE-TIER MARKETS · ON TIME / LATE / VERY LATE · ODDS PRICED FROM EACH STOP’S OWN HISTORY · MARKETS SETTLE ON REAL ARRIVAL DATA · PLAY MONEY, REAL TRAINS · '

function DepartureRow({ market }: { readonly market: Market }) {
  const delay = market.latest_predicted_arrival
    ? getDelayMinutes(market.scheduled_arrival, market.latest_predicted_arrival)
    : null

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#ffb800]/10 last:border-b-0">
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
    </div>
  )
}

export default function LandingPage() {
  const { data: markets } = useMarkets()
  const preview = (markets ?? []).slice(0, 6)

  return (
    <div className="min-h-screen bg-[#0c0d12]">
      {/* Marketing header */}
      <div className="flex items-center gap-3.5 px-5 sm:px-8 h-16 border-b-[3px] border-[#ffb800]">
        <span className="w-7 h-7 rounded-full bg-[#ffb800] text-[#0c0d12] inline-flex items-center justify-center text-[15px] font-bold">
          S
        </span>
        <span className="text-[15px] font-bold tracking-widest uppercase text-[#e9e9ed]">
          Signal Problems
        </span>
        <div className="flex-1" />
        <Link to="/login" className="hidden sm:inline text-sm font-medium text-[#8b8d9e] hover:text-[#e9e9ed]">
          Sign in
        </Link>
        <Link to="/about" className="hidden sm:inline text-sm font-medium text-[#8b8d9e] hover:text-[#e9e9ed]">
          How it works
        </Link>
        <button
          type="button"
          onClick={enterDemoMode}
          className="text-[11px] font-bold uppercase tracking-wide border border-[#9184d9] text-[#9184d9] px-4 py-2.5"
        >
          Try the demo
        </button>
      </div>

      {/* Hero */}
      <div className="px-5 sm:px-8 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-12 items-center">
          <div className="flex-1 min-w-[320px]">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-[#3ad07e] animate-sp-blink" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8b8d9e]">
                Live GTFS-Realtime
              </span>
            </div>
            <h1 className="text-[2.5rem] sm:text-6xl lg:text-7xl leading-[0.98] tracking-tight font-medium text-[#e9e9ed] text-balance">
              The train is late.
              <br />
              Someone should
              <br />
              profit from that.
            </h1>
            <p className="mt-6 max-w-[44ch] text-[17px] leading-relaxed text-[#a5a7b6]">
              A prediction market on New York City subway arrivals. Every train at every stop is
              priced on-time, late, or very late — from that platform's own history, settled
              against the MTA's own feed.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-8">
              <button
                type="button"
                onClick={enterDemoMode}
                className="text-[11px] font-bold uppercase tracking-widest border border-[#9184d9] text-[#9184d9] px-6 py-4 animate-sp-glow"
              >
                Enter the demo
              </button>
              <Link
                to="/about"
                className="text-[11px] font-bold uppercase tracking-widest border border-[#e9e9ed]/15 text-[#e9e9ed] px-6 py-4"
              >
                Read the odds engine
              </Link>
            </div>
            <div className="flex gap-1.5 mt-10 flex-wrap">
              {FILTER_LINES.map((line) => (
                <LineBadge key={line} line={line} size="sm" />
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[320px]">
            <div className="border border-[#ffb800]/30 bg-[#0a0b0f] shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#ffb800]/25">
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
                  No open markets right now — check back shortly.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="border-y border-[#ffb800]/20 bg-[#0a0b0f] overflow-hidden py-2.5">
        <div className="flex w-max animate-sp-marquee">
          <span className="shrink-0 pr-16 whitespace-nowrap text-xs font-bold tracking-widest uppercase text-[#ffb800]">
            {MARQUEE}
          </span>
          <span className="shrink-0 pr-16 whitespace-nowrap text-xs font-bold tracking-widest uppercase text-[#ffb800]">
            {MARQUEE}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#262a60] px-5 sm:px-8 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-4xl sm:text-5xl font-medium tracking-tight text-[#e9e9ed]">
                {s.value}
              </div>
              <div className="mt-2 text-[10px] font-bold tracking-widest uppercase text-[#e9e9ed]/60">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-5 sm:px-8 py-16 sm:py-24 max-w-6xl mx-auto grid gap-10 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <span className={`block w-9 h-[3px] mb-4 ${f.accent}`} />
            <h3 className="text-xl font-medium tracking-tight text-[#e9e9ed]">{f.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#8b8d9e]">{f.body}</p>
          </div>
        ))}
      </div>

      {/* Final CTA */}
      <div className="px-5 sm:px-8 py-16 sm:py-24 text-center border-t border-[#ffb800]/15">
        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#e9e9ed]">
          Stand on the platform. Take a position.
        </h2>
        <button
          type="button"
          onClick={enterDemoMode}
          className="inline-block mt-8 text-[11px] font-bold uppercase tracking-widest border border-[#9184d9] text-[#9184d9] px-8 py-4"
        >
          Enter the demo
        </button>
        <p className="mt-6 text-xs text-[#6b6d7a]">Play money. Real trains.</p>
      </div>
    </div>
  )
}
