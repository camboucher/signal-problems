import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MarketCard from './MarketCard'
import type { Database } from '../../types/database'

type MarketRow = Database['public']['Tables']['markets']['Row']

function market(overrides: Partial<MarketRow> = {}): MarketRow {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    trip_id: 'trip-abc123456789',
    route_id: 'N',
    stop_id: 'R16N',
    stop_name: 'Times Sq-42 St',
    scheduled_arrival: '2025-06-15T14:00:00.000Z',
    latest_predicted_arrival: null,
    status: 'open',
    outcome: null,
    actual_arrival: null,
    on_time_odds: 1.62,
    late_odds: 3.17,
    very_late_odds: 9.5,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function renderCard(m: MarketRow) {
  return render(
    <MemoryRouter>
      <MarketCard market={m} />
    </MemoryRouter>,
  )
}

describe('MarketCard', () => {
  it('links to the market detail route', () => {
    const m = market()
    renderCard(m)
    const link = screen.getByRole('link', { name: /Times Sq/i })
    expect(link).toHaveAttribute(
      'href',
      `/market/${m.id}`,
    )
  })

  it('shows delay when predicted arrival is after scheduled', () => {
    renderCard(
      market({
        latest_predicted_arrival: '2025-06-15T14:08:00.000Z',
      }),
    )
    expect(screen.getByText('+8 min')).toBeInTheDocument()
  })

  it('shows on time when prediction is not late', () => {
    renderCard(
      market({
        latest_predicted_arrival: '2025-06-15T13:59:00.000Z',
      }),
    )
    expect(screen.getByText('on time')).toBeInTheDocument()
  })

  it('shows market status', () => {
    renderCard(market({ status: 'closed' }))
    expect(screen.getByText('closed')).toBeInTheDocument()
  })
})
