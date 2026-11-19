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
  { value: 'wagered', label: 'My calls', authRequired: true },
  { value: 'favorited', label: 'Saved', authRequired: true },
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
      <div className="seg">
        {visibleModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onViewModeChange(mode.value)}
            className={`seg-btn ${viewMode === mode.value ? 'seg-btn-active' : ''}`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Line badges */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
        <button
          onClick={() => onLineChange(null)}
          className={`shrink-0 px-3 h-5 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-colors ${
            selectedLine === null
              ? 'border-sp-led text-sp-led'
              : 'border-sp-edge text-sp-dim hover:text-sp-text'
          }`}
        >
          All
        </button>
        {FILTER_LINES.map((line) => (
          <button
            key={line}
            onClick={() => onLineChange(selectedLine === line ? null : line)}
            aria-pressed={selectedLine === line}
            className={`shrink-0 rounded-full transition-[opacity,transform] ${
              selectedLine === line
                ? 'ring-2 ring-sp-led ring-offset-2 ring-offset-sp-bg'
                : selectedLine
                  ? 'opacity-40 hover:opacity-100'
                  : 'opacity-90 hover:opacity-100 hover:-translate-y-px'
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
          aria-label="Search stations"
          className="input flex-1"
        />

        <div className="seg shrink-0 self-stretch">
          <button
            onClick={() => onSortByChange('time')}
            className={`seg-btn ${sortBy === 'time' ? 'seg-btn-active' : ''}`}
          >
            Time
          </button>
          <button
            onClick={() => {
              onSortByChange('distance')
              if (locationStatus === 'idle') onRequestLocation()
            }}
            className={`seg-btn ${
              sortBy === 'distance'
                ? 'seg-btn-active'
                : locationStatus === 'denied' || locationStatus === 'error'
                  ? 'opacity-40 cursor-not-allowed'
                  : ''
            }`}
          >
            Near
          </button>
        </div>
      </div>

      {/* Location status message */}
      {sortBy === 'distance' && locationStatus === 'prompting' && (
        <p className="text-xs text-sp-dim">Finding you…</p>
      )}
      {sortBy === 'distance' && locationStatus === 'ready' && (
        <button
          type="button"
          onClick={onRequestLocation}
          className="text-xs text-sp-dim hover:text-sp-text underline underline-offset-2"
        >
          Update location
        </button>
      )}
      {sortBy === 'distance' && (locationStatus === 'denied' || locationStatus === 'error') && (
        <p className="text-xs text-sp-dim">
          We couldn't get your location, so trains are sorted by time.
        </p>
      )}
    </div>
  )
}
