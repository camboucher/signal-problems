import { useMemo, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { useMarkets } from '../hooks/use-markets'
import { useMyWagers } from '../hooks/use-profile'
import { useUserLocation } from '../hooks/use-user-location'
import { useFavoriteStops } from '../hooks/use-favorite-stops'
import MarketFilters, { type ViewMode, type SortBy } from '../components/markets/MarketFilters'
import MarketCard from '../components/markets/MarketCard'
import { parentStopId, haversineDistanceMeters } from '../lib/nearby-stops'
import { MTA_STATIONS } from '../lib/mta-stations'

function buildEmptyMessage(
  viewMode: ViewMode,
  selectedLine: string | null,
  search: string,
): string {
  if (viewMode === 'wagered') return 'No wagered trains in the current list.'
  if (viewMode === 'favorited') return 'No trains at your favorited stations.'
  const parts = ['No upcoming trains']
  if (selectedLine) parts.push(`for the ${selectedLine} train`)
  if (search) parts.push(`matching "${search}"`)
  return parts.join(' ')
}

function MarketList({
  emptyMessage,
  markets,
  isFavorite,
  onToggleFavorite,
}: Readonly<{
  emptyMessage: string
  markets: ReturnType<typeof useMarkets>['data']
  isFavorite: (stopId: string) => boolean
  onToggleFavorite: ((stopId: string) => void) | undefined
}>) {
  if (!markets?.length) {
    return (
      <div className="text-sm text-gray-400 text-center py-12 border border-dashed border-gray-200">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-px">
      {markets.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          isFavorite={isFavorite(parentStopId(market.stop_id))}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}

export default function MarketsPage() {
  const { profile, user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('open')
  const [sortBy, setSortBy] = useState<SortBy>('time')
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { coordinates, status: locationStatus, requestLocation } = useUserLocation()
  const { isFavorite, toggleFavorite, favoriteStopIds } = useFavoriteStops()
  const { data: markets, isLoading, error } = useMarkets({
    line: selectedLine,
    search: search || undefined,
    includeAll: viewMode === 'all',
  })
  const myWagersQuery = useMyWagers(user?.id)

  const wageredMarketIds = useMemo(
    () => new Set(myWagersQuery.data?.map((w) => w.market_id) ?? []),
    [myWagersQuery.data],
  )

  const displayedMarkets = useMemo(() => {
    let result = markets ?? []

    if (viewMode === 'wagered') {
      result = result.filter((m) => wageredMarketIds.has(m.id))
    } else if (viewMode === 'favorited') {
      result = result.filter((m) =>
        favoriteStopIds.includes(parentStopId(m.stop_id)),
      )
    }

    if (sortBy === 'distance' && coordinates) {
      result = [...result].sort((a, b) => {
        const sa = MTA_STATIONS[parentStopId(a.stop_id)]
        const sb = MTA_STATIONS[parentStopId(b.stop_id)]
        if (!sa && !sb) return 0
        if (!sa) return 1
        if (!sb) return -1
        return (
          haversineDistanceMeters(coordinates, sa) -
          haversineDistanceMeters(coordinates, sb)
        )
      })
    }

    return result
  }, [markets, viewMode, sortBy, coordinates, wageredMarketIds, favoriteStopIds])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold tracking-tight">Trains</h1>
        {profile && (
          <span className="text-sm font-medium tabular-nums">
            {profile.credits_balance.toLocaleString()} credits
          </span>
        )}
      </div>

      <MarketFilters
        selectedLine={selectedLine}
        onLineChange={setSelectedLine}
        search={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        isAuthenticated={!!user}
        locationStatus={locationStatus}
        onRequestLocation={requestLocation}
      />

      <div className="mt-6">
        {isLoading && (
          <div className="text-sm text-gray-400 text-center py-16">
            Loading trains…
          </div>
        )}
        {error && (
          <div className="text-sm text-red-500 text-center py-16">
            Failed to load trains
          </div>
        )}
        {!isLoading && !error && (
          <MarketList
            markets={displayedMarkets}
            emptyMessage={buildEmptyMessage(viewMode, selectedLine, search)}
            isFavorite={isFavorite}
            onToggleFavorite={user ? toggleFavorite : undefined}
          />
        )}
      </div>
    </div>
  )
}
