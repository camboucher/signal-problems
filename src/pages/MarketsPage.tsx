import { useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { useMarkets } from '../hooks/use-markets'
import MarketFilters from '../components/markets/MarketFilters'
import MarketCard from '../components/markets/MarketCard'

export default function MarketsPage() {
  const { profile } = useAuth()
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data: markets, isLoading, error } = useMarkets({
    line: selectedLine,
    search: search || undefined,
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold tracking-tight">Markets</h1>
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

      <div className="mt-5 space-y-px">
        {isLoading && (
          <div className="text-sm text-gray-400 text-center py-16">
            Loading markets…
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 text-center py-16">
            Failed to load markets
          </div>
        )}

        {!isLoading && !error && markets?.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-16 border border-dashed border-gray-200">
            No upcoming markets
            {selectedLine ? ` for the ${selectedLine} train` : ''}
            {search ? ` matching "${search}"` : ''}
          </div>
        )}

        {markets?.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  )
}
