import { MTA_FEEDS } from "./feeds.ts";
import { decodeGtfsRealtimeFeed } from "./gtfs-decode.ts";
import type { DecodedMtaFeed, FetchMtaFeedsResult } from "./types.ts";

/**
 * Fetches every MTA GTFS-RT endpoint in parallel and decodes protobuf payloads.
 * Failures are isolated per feed; other feeds still contribute data.
 */
export async function fetchAllMtaFeeds(): Promise<FetchMtaFeedsResult> {
  const results = await Promise.allSettled(
    MTA_FEEDS.map(async (feed) => {
      const res = await fetch(feed.url);
      if (!res.ok) throw new Error(`${feed.id}: HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      const data = decodeGtfsRealtimeFeed(buf);
      return { feedId: feed.id, data } satisfies DecodedMtaFeed;
    })
  );

  const decoded: DecodedMtaFeed[] = [];
  const errors: string[] = [];
  let feedsOk = 0;
  let feedsFailed = 0;

  for (const r of results) {
    if (r.status === "rejected") {
      feedsFailed++;
      errors.push(String(r.reason));
      continue;
    }
    feedsOk++;
    decoded.push(r.value);
  }

  return { decoded, feedsOk, feedsFailed, errors };
}
