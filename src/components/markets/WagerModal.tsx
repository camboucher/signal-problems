import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { WagerPrediction, Database } from '../../types/database'
import { usePlaceWager } from '../../hooks/use-place-wager'

type Market = Database['public']['Tables']['markets']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

const MIN_WAGER = 10
const MAX_WAGER = 500

interface Props {
  market: Market
  profile: Profile | null
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const TIERS: { prediction: WagerPrediction; label: string; sub: string; oddsKey: keyof Market }[] = [
  { prediction: 'on_time',   label: 'On time',   sub: 'Within 5 min', oddsKey: 'on_time_odds'   },
  { prediction: 'late',      label: 'Late',      sub: '5 to 20 min',  oddsKey: 'late_odds'      },
  { prediction: 'very_late', label: 'Very late', sub: '20+ min',      oddsKey: 'very_late_odds' },
]

const TIER_COLORS: Record<WagerPrediction, { active: string; border: string }> = {
  on_time:   { active: 'border-sp-on bg-sp-on/10 text-sp-on',     border: 'border-sp-edge text-sp-dim hover:border-sp-on/50' },
  late:      { active: 'border-sp-late bg-sp-late/10 text-sp-late', border: 'border-sp-edge text-sp-dim hover:border-sp-late/50' },
  very_late: { active: 'border-sp-very bg-sp-very/10 text-sp-very', border: 'border-sp-edge text-sp-dim hover:border-sp-very/50' },
}

export default function WagerModal({
  market,
  profile,
  userId,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [prediction, setPrediction] = useState<WagerPrediction | null>(null)
  const [amount, setAmount] = useState(100)
  const { mutate, isPending, error } = usePlaceWager()

  const balance = profile?.credits_balance ?? 0
  const maxAllowed = Math.min(MAX_WAGER, balance)
  const canSubmit =
    prediction !== null && amount >= MIN_WAGER && amount <= maxAllowed && !!userId

  const selectedOdds = prediction
    ? (market[TIERS.find((t) => t.prediction === prediction)!.oddsKey] as number)
    : null

  function handleSubmit() {
    if (!canSubmit || !userId || !prediction || selectedOdds === null) return
    mutate(
      {
        marketId: market.id,
        userId,
        prediction,
        amount,
        oddsAccepted: selectedOdds,
        currentBalance: balance,
      },
      {
        onSuccess: () => {
          setPrediction(null)
          setAmount(100)
          onOpenChange(false)
          onSuccess()
        },
      },
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed z-40 inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[calc(100%-2rem)] sm:max-w-sm bg-sp-panel border-t-[3px] border-sp-led sm:border sm:border-t-[3px] sm:border-x-sp-edge sm:border-b-sp-edge p-6 safe-bottom shadow-2xl focus:outline-none">
          <Dialog.Title className="text-xl font-medium tracking-tight">
            Make your call
          </Dialog.Title>
          <Dialog.Description className="text-xs text-sp-dim mt-1">
            When will the {market.route_id} really get to {market.stop_name}?
          </Dialog.Description>

          <div className="grid grid-cols-3 gap-2 mt-5">
            {TIERS.map((tier) => {
              const odds = market[tier.oddsKey] as number
              const isSelected = prediction === tier.prediction
              const colors = TIER_COLORS[tier.prediction]
              return (
                <button
                  key={tier.prediction}
                  type="button"
                  onClick={() => setPrediction(tier.prediction)}
                  className={`py-3 px-1 text-center border-2 transition-colors ${
                    isSelected ? colors.active : colors.border
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wide leading-tight">
                    {tier.label}
                  </div>
                  <div className="text-[10px] mt-0.5 opacity-70">{tier.sub}</div>
                  <div className="text-sm font-bold mt-1 tabular-nums">{odds.toFixed(2)}×</div>
                </button>
              )
            })}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sp-dim">
                How much?
              </span>
              <span className="text-xs text-sp-dim tabular-nums">
                You have {balance.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={MIN_WAGER}
              max={maxAllowed || MIN_WAGER}
              step={10}
              value={Math.min(amount, maxAllowed || MIN_WAGER)}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-sp-accent"
            />
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                min={MIN_WAGER}
                max={maxAllowed}
                step={10}
                value={amount}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setAmount(Math.max(MIN_WAGER, Math.min(maxAllowed, v)))
                }}
                className="input w-28 text-center tabular-nums"
              />
              <span className="text-xs text-sp-dim">credits</span>
            </div>
          </div>

          {prediction && selectedOdds !== null && (
            <div className="mt-4 px-3 py-2.5 bg-[#0c0d12] border border-[#ffb800]/30 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-[#8b8d9e]">If you're right, you get</span>
                <span className="text-base font-bold tabular-nums text-[#ffb800]">
                  {Math.round(amount * selectedOdds).toLocaleString()} credits
                </span>
              </div>
              <div className="flex justify-between mt-1 text-[#8b8d9e]">
                <span>Payout</span>
                <span className="tabular-nums">{selectedOdds.toFixed(2)}×</span>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-3 text-xs text-sp-very">
              {error instanceof Error ? error.message : "That didn't go through. Try again?"}
            </p>
          )}

          <div className="flex gap-3 mt-5">
            <Dialog.Close asChild>
              <button type="button" className="btn-secondary flex-1">
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isPending}
              className="btn-primary flex-1"
            >
              {isPending ? 'Locking in…' : 'Lock it in'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
