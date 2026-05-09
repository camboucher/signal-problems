import { describe, expect, it } from 'vitest'
import type { Database } from '../types/database'
import {
  nearestParentStopIds,
  parentStopId,
  partitionMarketsByNearbyStops,
} from './nearby-stops'

type Market = Database['public']['Tables']['markets']['Row']

function buildMarket(overrides: Partial<Market>): Market {
  return {
    id: 'market-1',
    trip_id: 'trip-near01',
    route_id: 'R',
    stop_id: 'R16N',
    stop_name: 'Times Sq-42 St',
    scheduled_arrival: '2025-06-15T14:00:00.000Z',
    latest_predicted_arrival: '2025-06-15T14:02:00.000Z',
    status: 'open',
    outcome: null,
    actual_arrival: null,
    on_time_odds: 1.62,
    late_odds: 3.17,
    very_late_odds: 9.5,
    created_at: '2025-06-15T13:00:00.000Z',
    updated_at: '2025-06-15T13:30:00.000Z',
    ...overrides,
  }
}

describe('parentStopId', () => {
  it('strips northbound and southbound suffixes', () => {
    expect(parentStopId('R16N')).toBe('R16')
    expect(parentStopId('R16S')).toBe('R16')
  })

  it('leaves parent stop ids unchanged', () => {
    expect(parentStopId('S31')).toBe('S31')
  })
})

describe('nearestParentStopIds', () => {
  it('returns the closest Times Square parent stops', () => {
    expect(nearestParentStopIds({ lat: 40.75529, lon: -73.987495 }, 3)).toEqual(
      expect.arrayContaining(['127', 'R16']),
    )
  })
})

describe('partitionMarketsByNearbyStops', () => {
  it('moves nearby stop ids into the nearby list without duplicates', () => {
    const nearby = buildMarket({})
    const far = buildMarket({
      id: 'market-2',
      trip_id: 'trip-far001',
      route_id: 'A',
      stop_id: 'A02N',
      stop_name: 'Inwood-207 St',
    })

    const result = partitionMarketsByNearbyStops([nearby, far], ['R16'])

    expect(result.nearbyMarkets).toEqual([nearby])
    expect(result.allMarkets).toEqual([far])
  })
})
