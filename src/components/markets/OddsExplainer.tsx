import type { Database } from '../../types/database'

type Market = Database['public']['Tables']['markets']['Row']
type StopStat = Database['public']['Tables']['stop_stats']['Row']

const VIG = 0.05
const MIN_ODDS = 1.1
const MAX_ODDS = 15.0
const BASELINE_RATE = 0.7

interface Props {
  market: Market
  stopStats: StopStat | null | undefined
}

export default function OddsExplainer({ market, stopStats }: Props) {
  const onTimeRate = stopStats?.on_time_rate ?? BASELINE_RATE
  const pOnTime = onTimeRate
  const pLate = (1 - onTimeRate) * 0.75
  const pVeryLate = (1 - onTimeRate) * 0.25

  return (
    <details className="card mt-3 group">
      <summary className="px-4 py-3 text-sm text-sp-dim hover:text-sp-text cursor-pointer select-none flex items-center justify-between list-none [&::-webkit-details-marker]:hidden transition-colors">
        Where do these payouts come from?
        <span className="text-sp-dim transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="px-4 pb-4 pt-1 border-t border-sp-edge space-y-3">
        <p className="text-xs text-sp-dim leading-relaxed">
          {stopStats ? (
            <>
              We've watched <strong className="text-sp-text">{stopStats.sample_count}</strong> of these trains
              arrive here. They were on time <strong className="text-sp-text">{Math.round(onTimeRate * 100)}%</strong> of the time.
            </>
          ) : (
            <>
              We don't have history for this train at this stop yet. Until we do, we assume it's on time{' '}
              <strong className="text-sp-text">{Math.round(BASELINE_RATE * 100)}%</strong> of the time.
            </>
          )}
          {' '}The rest of the chance gets split between <span className="text-sp-late">late</span> (75%) and{' '}
          <span className="text-sp-very">very late</span> (25%). Rarer outcomes pay more. We take a small{' '}
          {Math.round(VIG * 100)}% cut off each payout.
        </p>

        <table className="w-full text-xs">
          <thead>
            <tr className="text-sp-dim uppercase tracking-wide text-[10px]">
              <th className="text-left font-medium pb-1">Call</th>
              <th className="text-right font-medium pb-1">Chance</th>
              <th className="text-right font-medium pb-1">Pays</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            <OddsRow label="On time" color="text-sp-on" probability={pOnTime} odds={market.on_time_odds} />
            <OddsRow label="Late" color="text-sp-late" probability={pLate} odds={market.late_odds} />
            <OddsRow label="Very late" color="text-sp-very" probability={pVeryLate} odds={market.very_late_odds} />
          </tbody>
        </table>

        <p className="text-[11px] text-sp-dim leading-relaxed">
          For the curious: <code className="text-sp-text">payout = (1 / chance) × {1 - VIG}</code>, kept
          between {MIN_ODDS}× and {MAX_ODDS}×. Payouts are set when the train first shows up on the board and
          don't change after that. If you win, you get your credits times the payout.
        </p>
      </div>
    </details>
  )
}

function OddsRow({
  label,
  color,
  probability,
  odds,
}: {
  label: string
  color: string
  probability: number
  odds: number
}) {
  return (
    <tr className="border-t border-sp-edge/60">
      <td className={`py-1.5 font-medium ${color}`}>{label}</td>
      <td className="py-1.5 text-right text-sp-dim">{Math.round(probability * 100)}%</td>
      <td className="py-1.5 text-right font-bold">{odds.toFixed(2)}×</td>
    </tr>
  )
}
