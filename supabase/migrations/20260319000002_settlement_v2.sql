-- ─────────────────────────────────────────────────────────────
-- Settlement v2: three-tier outcomes and odds-based payouts.
--
-- Replaces the binary on_time/late settlement with:
--   on_time   → delay ≤ 5 min
--   late      → 5 < delay ≤ 20 min
--   very_late → delay > 20 min
--
-- Payout formula changed from amount * 2 to round(amount * odds_accepted).
-- Existing wagers have odds_accepted = 2.0 so their payouts are unchanged.
-- ─────────────────────────────────────────────────────────────
create or replace function public.settle_markets()
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  settled_count int;
begin
  -- Identify markets ready for settlement: closed, have a prediction,
  -- and the predicted arrival is at least 1 minute in the past.
  create temp table _just_settled on commit drop as
    select
      m.id as market_id,
      case
        when m.latest_predicted_arrival <= m.scheduled_arrival + interval '5 minutes'
          then 'on_time'::market_outcome
        when m.latest_predicted_arrival <= m.scheduled_arrival + interval '20 minutes'
          then 'late'::market_outcome
        else 'very_late'::market_outcome
      end as outcome
    from public.markets m
    where m.status = 'closed'
      and m.latest_predicted_arrival is not null
      and m.latest_predicted_arrival < now() - interval '1 minute';

  get diagnostics settled_count = row_count;

  if settled_count = 0 then
    return jsonb_build_object('settled', 0);
  end if;

  -- Flip market status and record the outcome
  update public.markets m
  set
    actual_arrival = m.latest_predicted_arrival,
    outcome        = js.outcome,
    status         = 'settled'
  from _just_settled js
  where m.id = js.market_id;

  -- Set payouts: winners get round(amount * odds_accepted), losers get 0
  update public.wagers w
  set payout = case
    when w.prediction::text = js.outcome::text
      then round(w.amount * w.odds_accepted)
    else 0
  end
  from _just_settled js
  where w.market_id = js.market_id
    and w.payout is null;

  -- Credit winning users
  with winnings as (
    select w.user_id, sum(w.payout) as total_payout
    from public.wagers w
    join _just_settled js on js.market_id = w.market_id
    where w.payout > 0
    group by w.user_id
  )
  update public.profiles p
  set credits_balance = p.credits_balance + win.total_payout
  from winnings win
  where p.id = win.user_id;

  -- Update historical on-time stats with a weighted running average
  with new_data as (
    select
      m.stop_id,
      m.route_id,
      count(*)::int as total,
      count(*) filter (where js.outcome = 'on_time') as on_time_count
    from _just_settled js
    join public.markets m on m.id = js.market_id
    group by m.stop_id, m.route_id
  )
  insert into public.stop_stats (stop_id, route_id, on_time_rate, sample_count)
  select
    stop_id,
    route_id,
    on_time_count::numeric / total,
    total
  from new_data
  on conflict (stop_id, route_id) do update set
    on_time_rate = (
      (stop_stats.on_time_rate * stop_stats.sample_count
       + excluded.on_time_rate * excluded.sample_count)
      / (stop_stats.sample_count + excluded.sample_count)
    ),
    sample_count = stop_stats.sample_count + excluded.sample_count,
    updated_at   = now();

  return jsonb_build_object('settled', settled_count);
end;
$$;
