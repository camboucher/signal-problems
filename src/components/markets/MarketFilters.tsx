import LineBadge from '../mta/LineBadge'
import { FILTER_LINES } from '../../lib/mta'

export type ViewMode = 'open' | 'all' | 'wagered' | 'favorited'
export type SortBy = 'time' | 'distance'
type LocationStatus = 'idle' | 'prompting' | 'denied' | 'error' | 'ready'

interface Props {
  selectedLine: string | null
  onLineChange: (line: string | null) => void
  search: string
  onSearchChange: (search: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortBy: SortBy
  onSortByChange: (sort: SortBy) => void
  isAuthenticated: boolean
  locationStatus: LocationStatus
  onRequestLocation: () => void
}

const VIEW_MODES: { value: ViewMode; label: string; authRequired: boolean }[] = [
  { value: 'open', label: 'Open', authRequired: false },
  { value: 'all', label: 'All', authRequired: false },
  { value: 'wagered', label: 'Wagered', authRequired: true },
  { value: 'favorited', label: 'Favorited', authRequired: true },
]

export default function MarketFilters({
  selectedLine,
  onLineChange,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  isAuthenticated,
  locationStatus,
  onRequestLocation,
}: Props) {
  const visibleModes = VIEW_MODES.filter(
    (m) => !m.authRequired || isAuthenticated,
  )

  return (
    <div className="space-y-3">
      {/* View mode tabs */}
      <div className="flex gap-1">
        {visibleModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onViewModeChange(mode.value)}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wide border transition-colors ${
              viewMode === mode.value
                ? 'bg-gray-950 text-white border-gray-950'
                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Line badges */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
        <button
          onClick={() => onLineChange(null)}
          className={`shrink-0 px-3 py-1 text-xs font-bold uppercase tracking-wide border ${
            selectedLine === null
              ? 'bg-gray-950 text-white border-gray-950'
              : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
          }`}
        >
          All
        </button>
        {FILTER_LINES.map((line) => (
          <button
            key={line}
            onClick={() => onLineChange(selectedLine === line ? null : line)}
            className={`shrink-0 rounded-full ${
              selectedLine === line
                ? 'ring-2 ring-sp-accent ring-offset-1 ring-offset-sp-bg'
                : 'opacity-80 hover:opacity-100'
            }`}
          >
            <LineBadge line={line} size="sm" />
          </button>
        ))}
      </div>

      {/* Search + sort row */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search stations…"
          className="input flex-1"
        />

        <div className="flex shrink-0 border border-gray-200 overflow-hidden">
          <button
            onClick={() => onSortByChange('time')}
            className={`px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
              sortBy === 'time'
                ? 'bg-gray-950 text-white'
                : 'bg-white text-gray-400 hover:text-gray-700'
            }`}
          >
            Time
          </button>
          <button
            onClick={() => {
              onSortByChange('distance')
              if (locationStatus === 'idle') onRequestLocation()
            }}
            className={`px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors border-l border-gray-200 ${
              sortBy === 'distance'
                ? 'bg-gray-950 text-white'
                : locationStatus === 'denied' || locationStatus === 'error'
                  ? 'bg-white text-gray-300 cursor-not-allowed'
                  : 'bg-white text-gray-400 hover:text-gray-700'
            }`}
          >
            Near
          </button>
        </div>
      </div>

      {/* Location status message */}
      {sortBy === 'distance' && locationStatus === 'prompting' && (
        <p className="text-xs text-gray-400">Waiting for your location…</p>
      )}
      {sortBy === 'distance' && locationStatus === 'ready' && (
        <button
          type="button"
          onClick={onRequestLocation}
          className="text-xs text-gray-400 hover:text-gray-700 underline"
        >
          Update location
        </button>
      )}
      {sortBy === 'distance' && (locationStatus === 'denied' || locationStatus === 'error') && (
        <p className="text-xs text-gray-400">
          Location unavailable — showing by time instead.
        </p>
      )}
    </div>
  )
}
