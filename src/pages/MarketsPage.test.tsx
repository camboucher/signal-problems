import { render, screen } from '@testing-library/react'
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

vi.mock('../hooks/use-profile', () => ({
  useMyWagers: vi.fn(),
}))

vi.mock('../hooks/use-favorite-stops', () => ({
  useFavoriteStops: vi.fn(),
}))

import { useAuth } from '../lib/auth-context'
import { useMarkets } from '../hooks/use-markets'
import { useUserLocation } from '../hooks/use-user-location'
import { useMyWagers } from '../hooks/use-profile'
import { useFavoriteStops } from '../hooks/use-favorite-stops'

const MOCK_MARKETS = [
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
]

describe('MarketsPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      user: null,
      profile: {
        id: 'user-1',
        username: 'rider',
        credits_balance: 1000,
        favorite_stop_ids: [],
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
      coordinates: null,
      errorMessage: null,
      requestLocation: vi.fn(),
      status: 'idle',
    })

    vi.mocked(useMarkets).mockReturnValue({
      data: MOCK_MARKETS,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useMarkets>)

    vi.mocked(useMyWagers).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useMyWagers>)

    vi.mocked(useFavoriteStops).mockReturnValue({
      favoriteStopIds: [],
      isFavorite: () => false,
      toggleFavorite: vi.fn(),
    })
  })

  it('renders all markets in a single unified list', () => {
    render(
      <MemoryRouter>
        <MarketsPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /near01/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /far001/i })).toBeInTheDocument()
  })

  it('shows loading state while markets are fetching', () => {
    vi.mocked(useMarkets).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useMarkets>)

    render(
      <MemoryRouter>
        <MarketsPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/loading trains/i)).toBeInTheDocument()
  })
})
