import { getStopName } from "./stops.ts";
import { toProtobufNumber } from "./protobuf-numbers.ts";
import type {
  ArrivalTimeWindow,
  DecodedMtaFeed,
  GtfsFeedEntity,
  MarketRow,
} from "./types.ts";

/**
 * Walks decoded trip updates and builds market rows for arrivals in the given time window.
 */
export function buildMarketsFromFeeds(
  feeds: DecodedMtaFeed[],
  window: ArrivalTimeWindow
): MarketRow[] {
  const markets: MarketRow[] = [];

  for (const { data } of feeds) {
    for (const entity of data.entity ?? []) {
      appendMarketsFromEntity(entity, window, markets);
    }
  }

  return markets;
}

function appendMarketsFromEntity(
  entity: GtfsFeedEntity,
  window: ArrivalTimeWindow,
  out: MarketRow[]
): void {
  const tu = entity.tripUpdate;
  if (!tu?.trip) return;

  const tripId = tu.trip.tripId;
  const routeId = tu.trip.routeId;
  if (!tripId || !routeId) return;

  for (const stu of tu.stopTimeUpdate ?? []) {
    const stopId = stu.stopId;
    if (!stopId) continue;

    const arrivalTime = toProtobufNumber(stu.arrival?.time);
    if (
      !arrivalTime ||
      arrivalTime < window.nowSec ||
      arrivalTime > window.horizonSec
    ) {
      continue;
    }

    const delay = stu.arrival?.delay ?? 0;
    const scheduledSec = arrivalTime - delay;

    out.push({
      trip_id: tripId,
      route_id: routeId,
      stop_id: stopId,
      stop_name: getStopName(stopId),
      scheduled_arrival: new Date(scheduledSec * 1000).toISOString(),
      predicted_arrival: new Date(arrivalTime * 1000).toISOString(),
    });
  }
}
