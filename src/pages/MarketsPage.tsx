import { useMemo, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { useMarkets } from '../hooks/use-markets'
import { useUserLocation } from '../hooks/use-user-location'
import MarketFilters from '../components/markets/MarketFilters'
import MarketCard from '../components/markets/MarketCard'
import { nearestStations, partitionMarketsByNearbyStops } from '../lib/nearby-stops'

function MarketList({
  emptyMessage,
  markets,
}: Readonly<{
  emptyMessage: string
  markets: ReturnType<typeof useMarkets>['data']
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
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  )
}

export default function MarketsPage() {
  const { profile } = useAuth()
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const {
    coordinates,
    errorMessage: locationError,
    requestLocation,
    status: locationStatus,
  } = useUserLocation()

  const { data: markets, isLoading, error } = useMarkets({
    line: selectedLine,
    search: search || undefined,
  })
  const allVisibleMarkets = markets ?? []
  const nearbyStationsList = useMemo(
    () => (coordinates ? nearestStations(coordinates, 3) : []),
    [coordinates],
  )
  const nearbyStopIds = nearbyStationsList.map((station) => station.stopId)
  const { nearbyMarkets, allMarkets } = useMemo(
    () =>
      coordinates
        ? partitionMarketsByNearbyStops(allVisibleMarkets, nearbyStopIds)
        : { nearbyMarkets: [], allMarkets: allVisibleMarkets },
    [allVisibleMarkets, coordinates, nearbyStopIds],
  )
  const nearestStationNames = nearbyStationsList.map((station) => station.name)
  const allTrainsEmptyMessageParts = ['No upcoming trains']
  if (selectedLine) allTrainsEmptyMessageParts.push(`for the ${selectedLine} train`)
  if (search) allTrainsEmptyMessageParts.push(`matching "${search}"`)
  const allTrainsEmptyMessage = allTrainsEmptyMessageParts.join(' ')

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
      />

      <div className="mt-6 space-y-8">
        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950">
                Nearby Trains
              </h2>
              {locationStatus === 'ready' && nearestStationNames.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Closest stations: {nearestStationNames.join(', ')}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={requestLocation}
              className="btn-secondary shrink-0"
            >
              {locationStatus === 'ready' ? 'Update location' : 'Use my location'}
            </button>
          </div>

          {locationStatus === 'idle' && (
            <div className="card px-4 py-4 text-sm text-gray-500">
              Use your location to pin the trains closest to you at the top.
            </div>
          )}

          {locationStatus === 'prompting' && (
            <div className="card px-4 py-4 text-sm text-gray-500">
              Waiting for your location…
            </div>
          )}

          {(locationStatus === 'denied' || locationStatus === 'error') && (
            <div className="card px-4 py-4 text-sm text-gray-500">
              {locationError}
            </div>
          )}

          {locationStatus === 'ready' && isLoading && (
            <div className="card px-4 py-4 text-sm text-gray-500">
              Loading nearby trains…
            </div>
          )}

          {locationStatus === 'ready' && error && (
            <div className="card px-4 py-4 text-sm text-red-500">
              Failed to load nearby trains
            </div>
          )}

          {locationStatus === 'ready' && !isLoading && !error && (
            <MarketList
              markets={nearbyMarkets}
              emptyMessage="No nearby trains in the current list."
            />
          )}
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950">
              All Trains
            </h2>
          </div>

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
              markets={locationStatus === 'ready' ? allMarkets : allVisibleMarkets}
              emptyMessage={allTrainsEmptyMessage}
            />
          )}
        </section>
      </div>
    </div>
  )
}
