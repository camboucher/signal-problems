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

  function handleSubmit() {
    if (!canSubmit || !userId || !prediction) return
    mutate(
      {
        marketId: market.id,
        userId,
        prediction,
        amount,
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
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white p-6 shadow-lg focus:outline-none">
          <Dialog.Title className="text-base font-bold tracking-tight">
            Place Wager
          </Dialog.Title>
          <Dialog.Description className="text-xs text-gray-400 mt-1">
            {market.route_id} · {market.stop_name}
          </Dialog.Description>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              type="button"
              onClick={() => setPrediction('on_time')}
              className={`py-4 text-sm font-bold uppercase tracking-wide border-2 transition-colors ${
                prediction === 'on_time'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              On Time
            </button>
            <button
              type="button"
              onClick={() => setPrediction('late')}
              className={`py-4 text-sm font-bold uppercase tracking-wide border-2 transition-colors ${
                prediction === 'late'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              Late
            </button>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Amount
              </span>
              <span className="text-xs text-gray-400 tabular-nums">
                {balance.toLocaleString()} available
              </span>
            </div>
            <input
              type="range"
              min={MIN_WAGER}
              max={maxAllowed || MIN_WAGER}
              step={10}
              value={Math.min(amount, maxAllowed || MIN_WAGER)}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-gray-950"
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
              <span className="text-xs text-gray-400">credits</span>
            </div>
          </div>

          {prediction && (
            <div className="mt-4 px-3 py-2 bg-gray-50 border border-gray-100 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Potential payout</span>
                <span className="font-bold tabular-nums">
                  {(amount * 2).toLocaleString()} credits
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">Odds</span>
                <span className="font-medium">1 : 1</span>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-3 text-xs text-red-500">
              {error instanceof Error ? error.message : 'Failed to place wager'}
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
              {isPending ? 'Placing…' : 'Place Wager'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
