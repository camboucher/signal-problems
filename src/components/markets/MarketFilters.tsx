import LineBadge from '../mta/LineBadge'
import { FILTER_LINES } from '../../lib/mta'

interface Props {
  selectedLine: string | null
  onLineChange: (line: string | null) => void
  search: string
  onSearchChange: (search: string) => void
}

export default function MarketFilters({
  selectedLine,
  onLineChange,
  search,
  onSearchChange,
}: Props) {
  return (
    <div className="space-y-3">
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
                ? 'ring-2 ring-gray-950 ring-offset-1'
                : 'opacity-80 hover:opacity-100'
            }`}
          >
            <LineBadge line={line} size="sm" />
          </button>
        ))}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search stations…"
        className="input"
      />
    </div>
  )
}
