import { describe, expect, it } from "vitest";
import { buildMarketsFromFeeds } from "./extract-markets.ts";
import type { DecodedMtaFeed } from "./types.ts";

describe("buildMarketsFromFeeds", () => {
  const nowSec = 1_000_000;
  const horizonSec = nowSec + 2 * 60 * 60;
  const window = { nowSec, horizonSec };

  it("builds a market row for an in-window arrival with delay", () => {
    const arrivalUnix = nowSec + 3600;
    const delaySec = 120;
    const feeds: DecodedMtaFeed[] = [
      {
        feedId: "test",
        data: {
          entity: [
            {
              tripUpdate: {
                trip: { tripId: "trip-1", routeId: "N" },
                stopTimeUpdate: [
                  {
                    stopId: "R01N",
                    arrival: { time: arrivalUnix, delay: delaySec },
                  },
                ],
              },
            },
          ],
        },
      },
    ];

    const markets = buildMarketsFromFeeds(feeds, window);
    expect(markets).toHaveLength(1);
    expect(markets[0]).toMatchObject({
      trip_id: "trip-1",
      route_id: "N",
      stop_id: "R01N",
      stop_name: "Astoria-Ditmars Blvd",
      predicted_arrival: new Date(arrivalUnix * 1000).toISOString(),
      scheduled_arrival: new Date((arrivalUnix - delaySec) * 1000).toISOString(),
    });
  });

  it("skips arrivals before the window", () => {
    const feeds: DecodedMtaFeed[] = [
      {
        feedId: "test",
        data: {
          entity: [
            {
              tripUpdate: {
                trip: { tripId: "t", routeId: "1" },
                stopTimeUpdate: [
                  { stopId: "101N", arrival: { time: nowSec - 1 } },
                ],
              },
            },
          ],
        },
      },
    ];
    expect(buildMarketsFromFeeds(feeds, window)).toHaveLength(0);
  });

  it("skips arrivals after the horizon", () => {
    const feeds: DecodedMtaFeed[] = [
      {
        feedId: "test",
        data: {
          entity: [
            {
              tripUpdate: {
                trip: { tripId: "t", routeId: "1" },
                stopTimeUpdate: [
                  { stopId: "101N", arrival: { time: horizonSec + 1 } },
                ],
              },
            },
          ],
        },
      },
    ];
    expect(buildMarketsFromFeeds(feeds, window)).toHaveLength(0);
  });

  it("ignores entities without trip id or route id", () => {
    const feeds: DecodedMtaFeed[] = [
      {
        feedId: "test",
        data: {
          entity: [
            {
              tripUpdate: {
                trip: { tripId: "", routeId: "N" },
                stopTimeUpdate: [
                  { stopId: "R01N", arrival: { time: nowSec + 100 } },
                ],
              },
            },
            {
              tripUpdate: {
                trip: { tripId: "x", routeId: "" },
                stopTimeUpdate: [
                  { stopId: "R01N", arrival: { time: nowSec + 100 } },
                ],
              },
            },
          ],
        },
      },
    ];
    expect(buildMarketsFromFeeds(feeds, window)).toHaveLength(0);
  });

  it("aggregates multiple feeds and entities", () => {
    const t = nowSec + 500;
    const feeds: DecodedMtaFeed[] = [
      {
        feedId: "a",
        data: {
          entity: [
            {
              tripUpdate: {
                trip: { tripId: "a1", routeId: "A" },
                stopTimeUpdate: [{ stopId: "A02N", arrival: { time: t, delay: 0 } }],
              },
            },
          ],
        },
      },
      {
        feedId: "b",
        data: {
          entity: [
            {
              tripUpdate: {
                trip: { tripId: "b1", routeId: "L" },
                stopTimeUpdate: [{ stopId: "L01N", arrival: { time: t + 1, delay: 0 } }],
              },
            },
          ],
        },
      },
    ];
    const markets = buildMarketsFromFeeds(feeds, window);
    expect(markets).toHaveLength(2);
    expect(markets.map((m) => m.trip_id).sort()).toEqual(["a1", "b1"]);
  });
});
