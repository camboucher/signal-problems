import GtfsRealtimeBindings from "npm:gtfs-realtime-bindings@1.1.1";
import type { GtfsFeedMessageObject } from "./types.ts";

const { FeedMessage } = GtfsRealtimeBindings.transit_realtime;

/** Decode raw GTFS-RT protobuf bytes to a plain object graph. */
export function decodeGtfsRealtimeFeed(buffer: ArrayBuffer): GtfsFeedMessageObject {
  const msg = FeedMessage.decode(new Uint8Array(buffer));
  return FeedMessage.toObject(msg, { longs: Number, enums: String }) as GtfsFeedMessageObject;
}
