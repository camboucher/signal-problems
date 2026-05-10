import type { TimeOfDayStats } from '../../hooks/use-profile-stats'

const LABEL: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
}

interface Props {
  data: TimeOfDayStats[]
}

export default function TimeOfDayChart({ data }: Props) {
  return (
    <div className="space-y-2.5">
      {data.map(({ bucket, wins, total }) => {
        const pct = total > 0 ? Math.round((wins / total) * 100) : null
        return (
          <div key={bucket}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 w-20">{LABEL[bucket]}</span>
              <span className="text-xs tabular-nums text-gray-400">
                {pct === null ? '—' : `${pct}% (${wins}/${total})`}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              {pct !== null && (
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 60 ? 'bg-emerald-400' : pct >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
