import LineBadge from '../mta/LineBadge'
import type { LineStats } from '../../hooks/use-profile-stats'

interface Props {
  lines: LineStats[]
}

export default function LineBreakdownTable({ lines }: Props) {
  if (lines.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-6">No settled wagers yet</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <th className="text-left py-2 pr-3 font-medium">Line</th>
            <th className="text-right py-2 px-2 font-medium">Wagers</th>
            <th className="text-right py-2 px-2 font-medium">Wagered</th>
            <th className="text-right py-2 px-2 font-medium">Net P/L</th>
            <th className="text-right py-2 pl-2 font-medium">ROI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {lines.map((row) => (
            <tr key={row.routeId}>
              <td className="py-2 pr-3">
                <LineBadge line={row.routeId} />
              </td>
              <td className="text-right py-2 px-2 tabular-nums text-gray-600">{row.wagerCount}</td>
              <td className="text-right py-2 px-2 tabular-nums text-gray-600">
                {row.wagered.toLocaleString()}
              </td>
              <td
                className={`text-right py-2 px-2 tabular-nums font-medium ${
                  row.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {row.netProfit >= 0 ? '+' : ''}
                {row.netProfit.toLocaleString()}
              </td>
              <td
                className={`text-right py-2 pl-2 tabular-nums font-medium ${
                  row.roi >= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {row.roi >= 0 ? '+' : ''}
                {(row.roi * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
