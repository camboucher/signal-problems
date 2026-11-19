import type { ReactNode } from 'react'
import LineBadge from '../mta/LineBadge'
import { Ticker } from '../signage/Signage'
import { useMarkets } from '../../hooks/use-markets'
import { getDelayMinutes } from '../../lib/mta'
import { SERVICE_NOTICES } from '../../lib/service-notices'

/** Live delay updates from open markets, interleaved with service notices. */
export default function ServiceTicker() {
  const { data: markets } = useMarkets()

  const delayed = (markets ?? [])
    .filter((m) => m.latest_predicted_arrival)
    .map((m) => ({
      m,
      delay: getDelayMinutes(m.scheduled_arrival, m.latest_predicted_arrival!),
    }))
    .slice(0, 8)

  const items: ReactNode[] = []
  delayed.forEach(({ m, delay }, i) => {
    items.push(
      <span className="inline-flex items-center gap-2">
        <LineBadge line={m.route_id} size="sm" />
        <span className="text-[#e9e9ed]">{m.stop_name}</span>
        <span className={delay > 0 ? 'text-[#ff5247]' : 'text-[#3ad07e]'}>
          {delay > 0 ? `+${delay} min` : 'on time'}
        </span>
      </span>,
    )
    if (i % 2 === 1) items.push(SERVICE_NOTICES[(i >> 1) % SERVICE_NOTICES.length])
  })

  return <Ticker items={items.length ? items : SERVICE_NOTICES} className="py-2" speed={60} />
}
