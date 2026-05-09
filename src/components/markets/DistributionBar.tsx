interface Props {
  onTimeAmount: number
  lateAmount: number
  veryLateAmount: number
}

export default function DistributionBar({ onTimeAmount, lateAmount, veryLateAmount }: Props) {
  const total = onTimeAmount + lateAmount + veryLateAmount

  if (total === 0) {
    return (
      <div className="h-6 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-wide">
        No wagers yet
      </div>
    )
  }

  const onTimePct    = Math.round((onTimeAmount    / total) * 100)
  const veryLatePct  = Math.round((veryLateAmount  / total) * 100)
  const latePct      = 100 - onTimePct - veryLatePct

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
            className="bg-amber-500 transition-all"
            style={{ width: `${latePct}%` }}
          />
        )}
        {veryLatePct > 0 && (
          <div
            className="bg-red-500 transition-all"
            style={{ width: `${veryLatePct}%` }}
          />
        )}
      </div>
      <div className="flex justify-between mt-1.5 text-xs">
        <span className="text-emerald-600 font-medium">ON TIME {onTimePct}%</span>
        {latePct > 0 && (
          <span className="text-amber-600 font-medium">LATE {latePct}%</span>
        )}
        <span className="text-red-600 font-medium">VERY LATE {veryLatePct}%</span>
      </div>
      <div className="flex justify-between text-[11px] text-gray-400 tabular-nums">
        <span>{onTimeAmount.toLocaleString()} credits</span>
        <span>{(lateAmount + veryLateAmount).toLocaleString()} credits</span>
      </div>
    </div>
  )
}
