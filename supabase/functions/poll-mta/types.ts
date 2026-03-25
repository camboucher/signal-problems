/** One row passed to the `upsert_markets` RPC (matches DB column semantics). */
export interface MarketRow {
  trip_id: string;
  route_id: string;
  stop_id: string;
  stop_name: string;
  scheduled_arrival: string;
  predicted_arrival: string;
}

/** Successful fetch + decode of a single MTA GTFS-RT feed. */
export interface DecodedMtaFeed {
  feedId: string;
  data: GtfsFeedMessageObject;
}

/**
 * Plain object from `FeedMessage.toObject` — only shapes we read are typed loosely.
 * Keeps extract-markets decoupled from protobufjs classes.
 */
export type GtfsFeedMessageObject = {
  entity?: GtfsFeedEntity[];
};

export type GtfsFeedEntity = {
  tripUpdate?: {
    trip?: { tripId?: string; routeId?: string };
    stopTimeUpdate?: GtfsStopTimeUpdate[];
  };
};

export type GtfsStopTimeUpdate = {
  stopId?: string;
  arrival?: { time?: unknown; delay?: number };
};

/** Outcome of parallel MTA HTTP fetches (some feeds may fail independently). */
export interface FetchMtaFeedsResult {
  decoded: DecodedMtaFeed[];
  feedsOk: number;
  feedsFailed: number;
  errors: string[];
}

/** Only arrivals between now and this horizon (Unix seconds) are turned into markets. */
export interface ArrivalTimeWindow {
  nowSec: number;
  horizonSec: number;
}
