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
              <span className="text-xs text-sp-dim w-20">{LABEL[bucket]}</span>
              <span className="text-xs tabular-nums text-sp-dim">
                {pct === null ? '—' : `${pct}% (${wins}/${total})`}
              </span>
            </div>
            <div className="h-2 bg-sp-panel2 rounded-full overflow-hidden">
              {pct !== null && (
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 60 ? 'bg-sp-on' : pct >= 40 ? 'bg-sp-late' : 'bg-sp-very'
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
