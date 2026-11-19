interface Props {
  label: string
  value: string
  subtitle?: string
  valueClass?: string
}

export default function StatCard({ label, value, subtitle, valueClass }: Props) {
  return (
    <div className="card px-4 py-3 text-center">
      <div className={`text-lg font-bold tabular-nums ${valueClass ?? ''}`}>{value}</div>
      <div className="text-[10px] font-bold text-sp-dim uppercase tracking-widest mt-1">{label}</div>
      {subtitle && <div className="text-[10px] text-sp-dim mt-0.5">{subtitle}</div>}
    </div>
  )
}
