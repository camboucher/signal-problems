import type { Database } from '../types/database'
import { MTA_STATIONS } from './mta-stations'

type Market = Database['public']['Tables']['markets']['Row']

export interface Coordinates {
  lat: number
  lon: number
}

export interface NearbyStation extends Coordinates {
  stopId: string
  name: string
  distanceMeters: number
}

const EARTH_RADIUS_METERS = 6_371_000

export function parentStopId(stopId: string): string {
  return stopId.replace(/[NS]$/, '')
}

export function haversineDistanceMeters(
  from: Coordinates,
  to: Coordinates,
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180
  const dLat = toRadians(to.lat - from.lat)
  const dLon = toRadians(to.lon - from.lon)
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.lat)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function nearestStations(
  userCoordinates: Coordinates,
  limit = 3,
): NearbyStation[] {
  return Object.entries(MTA_STATIONS)
    .map(([stopId, station]) => ({
      stopId,
      name: station.name,
      lat: station.lat,
      lon: station.lon,
      distanceMeters: haversineDistanceMeters(userCoordinates, station),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit)
}

export function nearestParentStopIds(
  userCoordinates: Coordinates,
  limit = 3,
): string[] {
  return nearestStations(userCoordinates, limit).map((station) => station.stopId)
}

export function partitionMarketsByNearbyStops(
  markets: Market[],
  nearbyStopIds: readonly string[],
): { nearbyMarkets: Market[]; allMarkets: Market[] } {
  const nearbySet = new Set(nearbyStopIds)
  const nearbyMarkets: Market[] = []
  const allMarkets: Market[] = []

  for (const market of markets) {
    if (nearbySet.has(parentStopId(market.stop_id))) {
      nearbyMarkets.push(market)
    } else {
      allMarkets.push(market)
    }
  }

  return { nearbyMarkets, allMarkets }
}
