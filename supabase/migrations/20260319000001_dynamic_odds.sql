-- ─────────────────────────────────────────────────────────────
-- Dynamic odds: add probability-based odds columns and a
-- third prediction/outcome tier ("very_late").
-- ─────────────────────────────────────────────────────────────

-- Extend enums (additive — safe for existing rows)
alter type public.wager_prediction add value if not exists 'very_late';
alter type public.market_outcome   add value if not exists 'very_late';

-- Add odds columns to markets
-- Defaults of 1.9 ≈ 50/50 with 5% vig; keeps existing open markets valid.
alter table public.markets
  add column if not exists on_time_odds   numeric(6,3) not null default 1.9,
  add column if not exists late_odds      numeric(6,3) not null default 1.9,
  add column if not exists very_late_odds numeric(6,3) not null default 1.9;

-- Add odds_accepted to wagers
-- Default 2.0 ensures old wagers (placed at 2×) still settle correctly.
alter table public.wagers
  add column if not exists odds_accepted numeric(6,3) not null default 2.0;

-- ─────────────────────────────────────────────────────────────
-- odds_for_stop: compute fixed-odds-with-vig from on_time_rate.
--
-- Tiers:
--   P(on_time)   = on_time_rate
--   P(late)      = (1 - on_time_rate) * 0.75
--   P(very_late) = (1 - on_time_rate) * 0.25
--
-- Formula: clamp(1.1, 15.0, (1 / P) * (1 - 0.05))
-- ─────────────────────────────────────────────────────────────
create or replace function public.odds_for_stop(
  p_stop_id  text,
  p_route_id text
)
returns table (on_time_odds numeric, late_odds numeric, very_late_odds numeric)
language plpgsql stable security definer set search_path = public
as $$
declare
  v_on_time_rate numeric;
  v_p_on_time    numeric;
  v_p_late       numeric;
  v_p_very_late  numeric;
  vig            constant numeric := 0.05;
  min_odds       constant numeric := 1.1;
  max_odds       constant numeric := 15.0;
begin
  select ss.on_time_rate into v_on_time_rate
  from public.stop_stats ss
  where ss.stop_id = p_stop_id and ss.route_id = p_route_id
  limit 1;

  v_on_time_rate := coalesce(v_on_time_rate, 0.70);

  v_p_on_time   := v_on_time_rate;
  v_p_late      := (1 - v_on_time_rate) * 0.75;
  v_p_very_late := (1 - v_on_time_rate) * 0.25;

  return query select
    greatest(min_odds, least(max_odds, (1.0 / v_p_on_time)   * (1 - vig))),
    greatest(min_odds, least(max_odds, (1.0 / v_p_late)      * (1 - vig))),
    greatest(min_odds, least(max_odds, (1.0 / v_p_very_late) * (1 - vig)));
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- upsert_markets: replace to include odds on INSERT.
--
-- On INSERT → compute odds from stop_stats and store them.
-- On CONFLICT → only update latest_predicted_arrival (odds locked at creation).
-- ─────────────────────────────────────────────────────────────
create or replace function public.upsert_markets(payload jsonb)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  upserted_count int;
begin
  with input as (
    select
      (item->>'trip_id')::text                        as trip_id,
      (item->>'route_id')::text                       as route_id,
      (item->>'stop_id')::text                        as stop_id,
      (item->>'stop_name')::text                      as stop_name,
      (item->>'scheduled_arrival')::timestamptz       as scheduled_arrival,
      (item->>'predicted_arrival')::timestamptz       as predicted_arrival
    from jsonb_array_elements(payload) as item
  ),
  input_with_odds as (
    select
      i.*,
      o.on_time_odds,
      o.late_odds,
      o.very_late_odds
    from input i
    cross join lateral public.odds_for_stop(i.stop_id, i.route_id) o
  ),
  ups as (
    insert into public.markets
      (trip_id, route_id, stop_id, stop_name, scheduled_arrival,
       latest_predicted_arrival, on_time_odds, late_odds, very_late_odds)
    select trip_id, route_id, stop_id, stop_name, scheduled_arrival,
           predicted_arrival, on_time_odds, late_odds, very_late_odds
    from input_with_odds
    on conflict (trip_id, stop_id) do update set
      latest_predicted_arrival = excluded.latest_predicted_arrival,
      route_id                 = excluded.route_id,
      updated_at               = now()
    where public.markets.status = 'open'
    returning 1
  )
  select count(*) into upserted_count from ups;

  return jsonb_build_object('upserted', upserted_count);
end;
$$;
