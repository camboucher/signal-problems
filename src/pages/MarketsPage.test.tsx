import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MarketsPage from './MarketsPage'

vi.mock('../lib/auth-context', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../hooks/use-markets', () => ({
  useMarkets: vi.fn(),
}))

vi.mock('../hooks/use-user-location', () => ({
  useUserLocation: vi.fn(),
}))

import { useAuth } from '../lib/auth-context'
import { useMarkets } from '../hooks/use-markets'
import { useUserLocation } from '../hooks/use-user-location'

describe('MarketsPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      user: null,
      profile: {
        id: 'user-1',
        username: 'rider',
        credits_balance: 1000,
        created_at: '2025-06-15T13:00:00.000Z',
        updated_at: '2025-06-15T13:00:00.000Z',
      },
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      updateUsername: vi.fn(),
      refreshProfile: vi.fn(),
    })

    vi.mocked(useUserLocation).mockReturnValue({
      coordinates: { lat: 40.75529, lon: -73.987495 },
      errorMessage: null,
      requestLocation: vi.fn(),
      status: 'ready',
    })

    vi.mocked(useMarkets).mockReturnValue({
      data: [
        {
          id: 'market-near',
          trip_id: 'trip-near01',
          route_id: 'R',
          stop_id: 'R16N',
          stop_name: 'Times Sq-42 St',
          scheduled_arrival: '2025-06-15T14:00:00.000Z',
          latest_predicted_arrival: '2025-06-15T14:01:00.000Z',
          status: 'open',
          outcome: null,
          actual_arrival: null,
          created_at: '2025-06-15T13:00:00.000Z',
          updated_at: '2025-06-15T13:00:00.000Z',
        },
        {
          id: 'market-far',
          trip_id: 'trip-far001',
          route_id: 'A',
          stop_id: 'A02N',
          stop_name: 'Inwood-207 St',
          scheduled_arrival: '2025-06-15T14:10:00.000Z',
          latest_predicted_arrival: '2025-06-15T14:13:00.000Z',
          status: 'open',
          outcome: null,
          actual_arrival: null,
          created_at: '2025-06-15T13:00:00.000Z',
          updated_at: '2025-06-15T13:00:00.000Z',
        },
      ],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useMarkets>)
  })

  it('splits nearby trains from the full train list', () => {
    render(
      <MemoryRouter>
        <MarketsPage />
      </MemoryRouter>,
    )

    const nearbySection = screen
      .getByRole('heading', { name: 'Nearby Trains' })
      .closest('section')
    const allSection = screen
      .getByRole('heading', { name: 'All Trains' })
      .closest('section')

    if (!nearbySection || !allSection) {
      throw new Error('Expected nearby and all trains sections to render')
    }

    expect(within(nearbySection).getByRole('link', { name: /near01/i })).toBeInTheDocument()
    expect(within(nearbySection).queryByRole('link', { name: /far001/i })).not.toBeInTheDocument()
    expect(within(allSection).getByRole('link', { name: /far001/i })).toBeInTheDocument()
    expect(within(allSection).queryByRole('link', { name: /near01/i })).not.toBeInTheDocument()
  })
})
