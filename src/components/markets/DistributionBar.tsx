interface Props {
  onTimeAmount: number
  lateAmount: number
  veryLateAmount: number
}

export default function DistributionBar({ onTimeAmount, lateAmount, veryLateAmount }: Props) {
  const total = onTimeAmount + lateAmount + veryLateAmount

  if (total === 0) {
    return (
      <div className="h-6 bg-sp-panel2 border border-dashed border-sp-edge flex items-center justify-center text-[10px] text-sp-dim uppercase tracking-widest">
        No wagers yet
      </div>
    )
  }

  const onTimePct    = Math.round((onTimeAmount    / total) * 100)
  const veryLatePct  = Math.round((veryLateAmount  / total) * 100)
  const latePct      = 100 - onTimePct - veryLatePct

  return (
    <div>
      <div className="h-6 flex overflow-hidden gap-px">
        {onTimePct > 0 && (
          <div
            className="bg-sp-on transition-all"
            style={{ width: `${onTimePct}%` }}
          />
        )}
        {latePct > 0 && (
          <div
            className="bg-sp-late transition-all"
            style={{ width: `${latePct}%` }}
          />
        )}
        {veryLatePct > 0 && (
          <div
            className="bg-sp-very transition-all"
            style={{ width: `${veryLatePct}%` }}
          />
        )}
      </div>
      <div className="flex justify-between mt-1.5 text-[11px] font-bold tracking-wide">
        <span className="text-sp-on">ON TIME {onTimePct}%</span>
        {latePct > 0 && (
          <span className="text-sp-late">LATE {latePct}%</span>
        )}
        <span className="text-sp-very">VERY LATE {veryLatePct}%</span>
      </div>
      <div className="flex justify-between text-[11px] text-sp-dim tabular-nums">
        <span>{onTimeAmount.toLocaleString()} credits</span>
        <span>{(lateAmount + veryLateAmount).toLocaleString()} credits</span>
      </div>
    </div>
  )
}
