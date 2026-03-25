import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  rpcCancelStaleMarkets,
  rpcCloseDueMarkets,
  rpcSettleMarkets,
  upsertMarketsInBatches,
} from "./supabase-market-actions.ts";
import type { MarketRow } from "./types.ts";

function makeSupabaseMock(rpcImpl: ReturnType<typeof vi.fn>): SupabaseClient {
  return { rpc: rpcImpl } as unknown as SupabaseClient;
}

describe("upsertMarketsInBatches", () => {
  it("calls upsert_markets RPC in batches of 1000 and sums upserted counts", async () => {
    const rpc = vi.fn(
      async (name: string, args: { payload: MarketRow[] } | undefined) => {
        if (name !== "upsert_markets") throw new Error("unexpected rpc");
        const n = args?.payload.length ?? 0;
        return {
          data: { upserted: n },
          error: null,
        };
      }
    );

    const rows: MarketRow[] = Array.from({ length: 2500 }, (_, i) => ({
      trip_id: `t${i}`,
      route_id: "1",
      stop_id: "101N",
      stop_name: "Test",
      scheduled_arrival: new Date().toISOString(),
      predicted_arrival: new Date().toISOString(),
    }));

    const total = await upsertMarketsInBatches(makeSupabaseMock(rpc), rows);

    expect(rpc).toHaveBeenCalledTimes(3);
    expect(total).toBe(2500);
  });

  it("uses batch length when RPC omits upserted", async () => {
    const rpc = vi.fn(async () => ({
      data: {},
      error: null,
    }));

    const row: MarketRow = {
      trip_id: "t",
      route_id: "1",
      stop_id: "101N",
      stop_name: "Test",
      scheduled_arrival: new Date().toISOString(),
      predicted_arrival: new Date().toISOString(),
    };

    const total = await upsertMarketsInBatches(makeSupabaseMock(rpc), [row]);
    expect(total).toBe(1);
  });

  it("skips failed batches when counting total", async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: { message: "boom" },
    }));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const row: MarketRow = {
      trip_id: "t",
      route_id: "1",
      stop_id: "101N",
      stop_name: "Test",
      scheduled_arrival: new Date().toISOString(),
      predicted_arrival: new Date().toISOString(),
    };

    const total = await upsertMarketsInBatches(makeSupabaseMock(rpc), [row]);
    expect(total).toBe(0);
    spy.mockRestore();
  });
});

describe("rpcCloseDueMarkets", () => {
  it("invokes close_due_markets RPC", async () => {
    const rpc = vi.fn(async () => ({ error: null }));
    await rpcCloseDueMarkets(makeSupabaseMock(rpc));
    expect(rpc).toHaveBeenCalledWith("close_due_markets");
  });
});

describe("rpcCancelStaleMarkets", () => {
  it("invokes cancel_stale_markets RPC", async () => {
    const rpc = vi.fn(async () => ({ error: null }));
    await rpcCancelStaleMarkets(makeSupabaseMock(rpc));
    expect(rpc).toHaveBeenCalledWith("cancel_stale_markets");
  });
});

describe("rpcSettleMarkets", () => {
  it("invokes settle_markets RPC and returns settled count", async () => {
    const rpc = vi.fn(async () => ({
      data: { settled: 5 },
      error: null,
    }));
    const result = await rpcSettleMarkets(makeSupabaseMock(rpc));
    expect(rpc).toHaveBeenCalledWith("settle_markets");
    expect(result).toEqual({ settled: 5 });
  });

  it("returns 0 settled on error", async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: { message: "boom" },
    }));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await rpcSettleMarkets(makeSupabaseMock(rpc));
    expect(result).toEqual({ settled: 0 });
    spy.mockRestore();
  });

  it("handles null data gracefully", async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: null,
    }));
    const result = await rpcSettleMarkets(makeSupabaseMock(rpc));
    expect(result).toEqual({ settled: 0 });
  });
});
