interface Props {
  onTimeAmount: number
  lateAmount: number
}

export default function DistributionBar({ onTimeAmount, lateAmount }: Props) {
  const total = onTimeAmount + lateAmount

  if (total === 0) {
    return (
      <div className="h-6 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-wide">
        No wagers yet
      </div>
    )
  }

  const onTimePct = Math.round((onTimeAmount / total) * 100)
  const latePct = 100 - onTimePct

  return (
    <div>
      <div className="h-6 flex overflow-hidden">
        {onTimePct > 0 && (
          <div
            className="bg-emerald-500 transition-all"
            style={{ width: `${onTimePct}%` }}
          />
        )}
        {latePct > 0 && (
          <div
            className="bg-red-500 transition-all"
            style={{ width: `${latePct}%` }}
          />
        )}
      </div>
      <div className="flex justify-between mt-1.5 text-xs">
        <span className="text-emerald-600 font-medium">ON TIME {onTimePct}%</span>
        <span className="text-red-600 font-medium">LATE {latePct}%</span>
      </div>
      <div className="flex justify-between text-[11px] text-gray-400 tabular-nums">
        <span>{onTimeAmount.toLocaleString()} credits</span>
        <span>{lateAmount.toLocaleString()} credits</span>
      </div>
    </div>
  )
}
