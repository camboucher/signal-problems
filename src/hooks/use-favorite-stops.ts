import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import { isMockMode } from '../lib/mock-mode'
import { toggleMockFavorite } from '../mock/data'

export function useFavoriteStops() {
  const { user, profile, refreshProfile } = useAuth()

  const favoriteStopIds: string[] = profile?.favorite_stop_ids ?? []

  const isFavorite = useCallback(
    (stopId: string) => favoriteStopIds.includes(stopId),
    [favoriteStopIds],
  )

  const toggleFavorite = useCallback(
    async (stopId: string) => {
      if (isMockMode()) {
        toggleMockFavorite(stopId)
        return
      }
      if (!user) return
      const next = favoriteStopIds.includes(stopId)
        ? favoriteStopIds.filter((id) => id !== stopId)
        : [...favoriteStopIds, stopId]
      const { error } = await supabase
        .from('profiles')
        .update({ favorite_stop_ids: next })
        .eq('id', user.id)
      if (!error) await refreshProfile()
    },
    [user, favoriteStopIds, refreshProfile],
  )

  return { favoriteStopIds, isFavorite, toggleFavorite }
}
