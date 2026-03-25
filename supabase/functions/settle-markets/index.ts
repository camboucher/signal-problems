import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const t0 = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settleResult, error: settleErr } = await supabase.rpc(
      "settle_markets",
    );
    if (settleErr) throw settleErr;

    const { data: _cancelResult, error: cancelErr } = await supabase.rpc(
      "cancel_stale_markets",
    );
    if (cancelErr) throw cancelErr;

    const elapsed = Date.now() - t0;
    const body = {
      ok: true,
      elapsed_ms: elapsed,
      ...(settleResult as Record<string, unknown>),
    };

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("settle-markets fatal:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
