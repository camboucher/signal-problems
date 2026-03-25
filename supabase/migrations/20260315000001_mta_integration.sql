-- ─────────────────────────────────────────────────────────────
-- MTA Integration: DB functions + pg_cron scheduling
-- ─────────────────────────────────────────────────────────────

-- pg_net: allows pg_cron to make HTTP calls to edge functions
create extension if not exists "pg_net" with schema extensions;

-- ─────────────────────────────────────────────────────────────
-- upsert_markets: batch upsert called by the poll-mta edge fn
--
-- On INSERT → sets both scheduled_arrival and latest_predicted_arrival.
-- On CONFLICT (same trip+stop already exists) → only updates
--   latest_predicted_arrival, preserving the original schedule.
--   Skips rows whose market is no longer open.
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
      (item->>'trip_id')::text           as trip_id,
      (item->>'route_id')::text          as route_id,
      (item->>'stop_id')::text           as stop_id,
      (item->>'stop_name')::text         as stop_name,
      (item->>'scheduled_arrival')::timestamptz  as scheduled_arrival,
      (item->>'predicted_arrival')::timestamptz  as predicted_arrival
    from jsonb_array_elements(payload) as item
  ),
  ups as (
    insert into public.markets
      (trip_id, route_id, stop_id, stop_name, scheduled_arrival, latest_predicted_arrival)
    select trip_id, route_id, stop_id, stop_name, scheduled_arrival, predicted_arrival
    from input
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

-- ─────────────────────────────────────────────────────────────
-- close_due_markets: close betting 2 min before scheduled arrival
-- ─────────────────────────────────────────────────────────────
create or replace function public.close_due_markets()
returns void
language sql
security definer set search_path = public
as $$
  update public.markets
  set status = 'closed'
  where status = 'open'
    and scheduled_arrival <= now() + interval '2 minutes';
$$;

-- ─────────────────────────────────────────────────────────────
-- cancel_stale_markets: cancel closed markets with no arrival
-- data 30 min past scheduled, and refund all wagers
-- ─────────────────────────────────────────────────────────────
create or replace function public.cancel_stale_markets()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  -- Refund wagers for markets about to be cancelled
  with stale as (
    select id from public.markets
    where status = 'closed'
      and actual_arrival is null
      and scheduled_arrival < now() - interval '30 minutes'
  )
  update public.profiles p
  set credits_balance = p.credits_balance + w.amount
  from public.wagers w
  join stale s on s.id = w.market_id
  where w.user_id = p.id
    and w.payout is null;

  -- Mark those wagers as refunded
  with stale as (
    select id from public.markets
    where status = 'closed'
      and actual_arrival is null
      and scheduled_arrival < now() - interval '30 minutes'
  )
  update public.wagers w
  set payout = w.amount
  from stale s
  where s.id = w.market_id
    and w.payout is null;

  -- Finally flip the market status
  update public.markets
  set status = 'cancelled'
  where status = 'closed'
    and actual_arrival is null
    and scheduled_arrival < now() - interval '30 minutes';
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- pg_cron: pure-SQL jobs (no HTTP needed)
-- ─────────────────────────────────────────────────────────────

-- Close markets every minute
select cron.schedule(
  'close-due-markets',
  '* * * * *',
  $$select public.close_due_markets()$$
);

-- Cancel stale markets every 5 minutes
select cron.schedule(
  'cancel-stale-markets',
  '*/5 * * * *',
  $$select public.cancel_stale_markets()$$
);

-- ─────────────────────────────────────────────────────────────
-- pg_cron + pg_net: poll MTA feeds every minute via HTTP
--
-- After deploying the poll-mta edge function, run this once
-- in the SQL editor (replace the placeholder values):
--
--   select cron.schedule(
--     'poll-mta-feeds',
--     '* * * * *',
--     $$
--     select net.http_post(
--       url    := 'https://<PROJECT_REF>.supabase.co/functions/v1/poll-mta',
--       headers := jsonb_build_object(
--         'Authorization', 'Bearer <SERVICE_ROLE_KEY>',
--         'Content-Type',  'application/json'
--       ),
--       body   := '{}'::jsonb
--     );
--     $$
--   );
--
-- For local dev with `supabase start`:
--
--   select cron.schedule(
--     'poll-mta-feeds',
--     '* * * * *',
--     $$
--     select net.http_post(
--       url    := 'http://host.docker.internal:54321/functions/v1/poll-mta',
--       headers := jsonb_build_object(
--         'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
--         'Content-Type',  'application/json'
--       ),
--       body   := '{}'::jsonb
--     );
--     $$
--   );
-- ─────────────────────────────────────────────────────────────
