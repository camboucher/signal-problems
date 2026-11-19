import LineBadge from '../mta/LineBadge'
import type { LineStats } from '../../hooks/use-profile-stats'

interface Props {
  lines: LineStats[]
}

export default function LineBreakdownTable({ lines }: Props) {
  if (lines.length === 0) {
    return <p className="text-sm text-sp-dim text-center py-6">No finished calls yet</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] text-sp-dim uppercase tracking-wide border-b border-sp-edge">
            <th className="text-left py-2 pr-3 font-medium">Line</th>
            <th className="text-right py-2 px-2 font-medium">Calls</th>
            <th className="text-right py-2 px-2 font-medium">Staked</th>
            <th className="text-right py-2 px-2 font-medium">Net</th>
            <th className="text-right py-2 pl-2 font-medium">Return</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sp-edge">
          {lines.map((row) => (
            <tr key={row.routeId}>
              <td className="py-2 pr-3">
                <LineBadge line={row.routeId} />
              </td>
              <td className="text-right py-2 px-2 tabular-nums text-sp-text">{row.wagerCount}</td>
              <td className="text-right py-2 px-2 tabular-nums text-sp-text">
                {row.wagered.toLocaleString()}
              </td>
              <td
                className={`text-right py-2 px-2 tabular-nums font-medium ${
                  row.netProfit >= 0 ? 'text-sp-on' : 'text-sp-very'
                }`}
              >
                {row.netProfit >= 0 ? '+' : ''}
                {row.netProfit.toLocaleString()}
              </td>
              <td
                className={`text-right py-2 pl-2 tabular-nums font-medium ${
                  row.roi >= 0 ? 'text-sp-on' : 'text-sp-very'
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
