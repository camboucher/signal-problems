import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./gtfs-decode.ts", () => ({
  decodeGtfsRealtimeFeed: () => ({
    entity: [
      {
        tripUpdate: {
          trip: { tripId: "mock-trip", routeId: "1" },
          stopTimeUpdate: [
            { stopId: "101N", arrival: { time: 1_000_000, delay: 0 } },
          ],
        },
      },
    ],
  }),
}));

import { fetchAllMtaFeeds } from "./fetch-mta-feeds.ts";
import { MTA_FEEDS } from "./feeds.ts";

describe("fetchAllMtaFeeds", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      } as Response)
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it("decodes every feed and counts successes", async () => {
    const result = await fetchAllMtaFeeds();

    expect(result.feedsOk).toBe(MTA_FEEDS.length);
    expect(result.feedsFailed).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(result.decoded).toHaveLength(MTA_FEEDS.length);
    expect(result.decoded[0]).toMatchObject({
      feedId: MTA_FEEDS[0].id,
      data: { entity: expect.any(Array) },
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(MTA_FEEDS.length);
  });

  it("isolates failed feeds and still returns others", async () => {
    let call = 0;
    globalThis.fetch = vi.fn(() => {
      call++;
      if (call === 1) {
        return Promise.resolve({
          ok: false,
          status: 503,
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)),
      } as Response);
    });

    const result = await fetchAllMtaFeeds();

    expect(result.feedsFailed).toBe(1);
    expect(result.feedsOk).toBe(MTA_FEEDS.length - 1);
    expect(result.errors.some((e) => e.includes("503"))).toBe(true);
    expect(result.decoded).toHaveLength(MTA_FEEDS.length - 1);
  });
});
