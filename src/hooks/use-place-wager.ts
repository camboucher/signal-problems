import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { isMockMode } from '../lib/mock-mode'
import { applyMockWager } from '../mock/data'
import type { WagerPrediction } from '../types/database'

interface PlaceWagerArgs {
  marketId: string
  userId: string
  prediction: WagerPrediction
  amount: number
  currentBalance: number
}

export function usePlaceWager() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      marketId,
      userId,
      prediction,
      amount,
      currentBalance,
    }: PlaceWagerArgs) => {
      if (isMockMode()) {
        applyMockWager({ marketId, userId, prediction, amount })
        return
      }

      const { error: wagerErr } = await supabase.from('wagers').insert({
        user_id: userId,
        market_id: marketId,
        prediction,
        amount,
      })
      if (wagerErr) throw wagerErr

      const { error: creditErr } = await supabase
        .from('profiles')
        .update({ credits_balance: currentBalance - amount })
        .eq('id', userId)
      if (creditErr) throw creditErr
    },
    onSuccess: (_data, { marketId }) => {
      queryClient.invalidateQueries({ queryKey: ['market-wagers', marketId] })
      queryClient.invalidateQueries({ queryKey: ['markets'] })
    },
  })
}
