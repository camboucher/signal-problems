import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LiveDot, PageHeader } from '../components/signage/Signage'
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
  if (viewMode === 'wagered') return "You haven't made a call on any of these trains yet."
  if (viewMode === 'favorited') return 'Nothing coming to your saved stations right now. Tap the star on a train to save its station.'
  const parts = ['No trains coming up']
  if (selectedLine) parts.push(`on the ${selectedLine}`)
  if (search) parts.push(`at "${search}"`)
  return `${parts.join(' ')}. Try another line or check back in a minute.`
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
  onToggleFavorite: ((stopId: string) => Promise<Error | undefined>) | undefined
}>) {
  if (!markets?.length) {
    return (
      <div className="empty-state">
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
      <PageHeader
        kicker="Live board"
        live
        title="Next trains"
        right={
          profile && (
            <div className="text-right">
              <div className="text-lg font-bold tabular-nums text-sp-led leading-none">
                {profile.credits_balance.toLocaleString()}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-sp-dim mt-1">
                Credits
              </div>
            </div>
          )
        }
      />
      {!user && (
        <p className="text-sm text-sp-dim -mt-2 mb-5 leading-relaxed">
          Tap any train to see the odds.{' '}
          <Link to="/signup" className="text-sp-accent font-medium hover:underline underline-offset-2">
            Sign up
          </Link>{' '}
          to start making calls with 1,000 free play credits.
        </p>
      )}

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
          <div className="flex items-center justify-center gap-2.5 text-sm text-sp-dim py-16">
            <LiveDot tone="led" />
            Loading trains…
          </div>
        )}
        {error && (
          <div className="empty-state text-sp-very border-sp-very/30">
            We couldn't reach the train feed. Give it a moment and try again.
          </div>
        )}
        {!isLoading && !error && displayedMarkets.length > 0 && (
          <div className="hidden xs:flex items-center justify-end gap-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-sp-dim">
            <span>Pays if you're right:</span>
            <span className="text-sp-on">On time</span>
            <span className="text-sp-late">Late</span>
            <span className="text-sp-very">Very late</span>
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
