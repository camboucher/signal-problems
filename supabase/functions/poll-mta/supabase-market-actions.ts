import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { MarketRow } from "./types.ts";

const BATCH_SIZE = 1000;

/**
 * Batch RPC to `upsert_markets`; returns total rows reported upserted.
 */
export async function upsertMarketsInBatches(
  supabase: SupabaseClient,
  markets: MarketRow[]
): Promise<number> {
  let total = 0;

  for (let i = 0; i < markets.length; i += BATCH_SIZE) {
    const batch = markets.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.rpc("upsert_markets", {
      payload: batch,
    });

    if (error) {
      console.error(`Upsert batch ${Math.floor(i / BATCH_SIZE)} error:`, error);
      continue;
    }

    total += (data as { upserted?: number } | null)?.upserted ?? batch.length;
  }

  return total;
}

/** Marks open markets as closed when scheduled arrival is within 2 minutes. */
export async function rpcCloseDueMarkets(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.rpc("close_due_markets");
  if (error) console.error("close_due_markets error:", error);
}

/** Cancels stale closed markets and refunds wagers. */
export async function rpcCancelStaleMarkets(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.rpc("cancel_stale_markets");
  if (error) console.error("cancel_stale_markets error:", error);
}
