import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildMarketsFromFeeds } from "./extract-markets.ts";
import { fetchAllMtaFeeds } from "./fetch-mta-feeds.ts";
import {
  rpcCancelStaleMarkets,
  rpcCloseDueMarkets,
  upsertMarketsInBatches,
} from "./supabase-market-actions.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const t0 = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const nowSec = Math.floor(Date.now() / 1000);
    const twoHoursFromNow = nowSec + 2 * 60 * 60;

    const fetchResult = await fetchAllMtaFeeds();
    const markets = buildMarketsFromFeeds(fetchResult.decoded, {
      nowSec,
      horizonSec: twoHoursFromNow,
    });

    const upsertedCount = await upsertMarketsInBatches(supabase, markets);
    await rpcCloseDueMarkets(supabase);
    await rpcCancelStaleMarkets(supabase);

    const elapsed = Date.now() - t0;
    const body = {
      ok: true,
      elapsed_ms: elapsed,
      feeds_ok: fetchResult.feedsOk,
      feeds_failed: fetchResult.feedsFailed,
      markets_upserted: upsertedCount,
      ...(fetchResult.errors.length > 0 && { errors: fetchResult.errors }),
    };

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("poll-mta fatal:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
