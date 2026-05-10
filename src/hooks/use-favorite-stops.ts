import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import { isMockMode } from '../lib/mock-mode'
import { toggleMockFavorite } from '../mock/data'
import { parentStopId } from '../lib/nearby-stops'

export function useFavoriteStops() {
  const { user, profile, patchProfile } = useAuth()

  const favoriteStopIds: string[] = profile?.favorite_stop_ids ?? []

  const isFavorite = useCallback(
    (stopId: string) => favoriteStopIds.includes(stopId),
    [favoriteStopIds],
  )

  const toggleFavorite = useCallback(
    async (rawStopId: string): Promise<Error | undefined> => {
      const stopId = parentStopId(rawStopId)

      if (isMockMode()) {
        toggleMockFavorite(stopId)
        return
      }
      if (!user) return

      const previous = favoriteStopIds
      const next = previous.includes(stopId)
        ? previous.filter((id) => id !== stopId)
        : [...previous, stopId]

      patchProfile({ favorite_stop_ids: next })

      const { error } = await supabase
        .from('profiles')
        .update({ favorite_stop_ids: next })
        .eq('id', user.id)

      if (error) {
        patchProfile({ favorite_stop_ids: previous })
        return error
      }
    },
    [user, favoriteStopIds, patchProfile],
  )

  return { favoriteStopIds, isFavorite, toggleFavorite }
}
