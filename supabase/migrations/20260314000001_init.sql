-- pg_cron: enable in Dashboard → Database → Extensions if not already available
create extension if not exists "pg_cron";

-- ─────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  username       text unique,
  credits_balance integer not null default 0 check (credits_balance >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint username_length check (char_length(username) between 3 and 20),
  constraint username_chars  check (username ~ '^[a-zA-Z0-9_]+$')
);

comment on table public.profiles is 'Public user profiles extending auth.users';

-- ─────────────────────────────────────────
-- markets
-- ─────────────────────────────────────────
create type public.market_status as enum ('open', 'closed', 'settled', 'cancelled');
create type public.market_outcome as enum ('on_time', 'late');

create table public.markets (
  id                        uuid primary key default gen_random_uuid(),
  trip_id                   text not null,
  route_id                  text not null,
  stop_id                   text not null,
  stop_name                 text not null,
  scheduled_arrival         timestamptz not null,
  latest_predicted_arrival  timestamptz,
  status                    public.market_status not null default 'open',
  outcome                   public.market_outcome,
  actual_arrival            timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  unique (trip_id, stop_id)
);

create index markets_status_scheduled on public.markets (status, scheduled_arrival);
create index markets_route_id         on public.markets (route_id);
create index markets_stop_id          on public.markets (stop_id);

comment on table public.markets is 'One row per train-at-stop prediction market';
comment on column public.markets.status is 'open→closed 2 min before scheduled; settled/cancelled after arrival window';

-- ─────────────────────────────────────────
-- wagers
-- ─────────────────────────────────────────
create type public.wager_prediction as enum ('on_time', 'late');

create table public.wagers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  market_id   uuid not null references public.markets(id) on delete cascade,
  prediction  public.wager_prediction not null,
  amount      integer not null check (amount between 10 and 500),
  payout      integer,
  created_at  timestamptz not null default now(),

  unique (user_id, market_id)
);

create index wagers_user_id   on public.wagers (user_id);
create index wagers_market_id on public.wagers (market_id);

comment on table public.wagers is 'User predictions on markets; payout null until settled';

-- ─────────────────────────────────────────
-- stop_stats
-- ─────────────────────────────────────────
create table public.stop_stats (
  id           uuid primary key default gen_random_uuid(),
  stop_id      text not null,
  route_id     text not null,
  on_time_rate numeric(5,4) not null check (on_time_rate between 0 and 1),
  sample_count integer not null default 0,
  updated_at   timestamptz not null default now(),

  unique (stop_id, route_id)
);

create index stop_stats_stop_route on public.stop_stats (stop_id, route_id);

comment on table public.stop_stats is 'Precomputed historical on-time rate per stop+route';

-- ─────────────────────────────────────────
-- Trigger: auto-create profile + issue 1000 credits on signup
-- ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, credits_balance)
  values (new.id, 1000);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────
-- Trigger: keep updated_at current
-- ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger markets_updated_at
  before update on public.markets
  for each row execute function public.set_updated_at();

create trigger stop_stats_updated_at
  before update on public.stop_stats
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────

-- profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- markets
alter table public.markets enable row level security;

create policy "Markets are viewable by everyone"
  on public.markets for select using (true);

-- Only service-role (edge functions) can insert/update markets
create policy "Service role can manage markets"
  on public.markets for all
  using (auth.role() = 'service_role');

-- wagers
alter table public.wagers enable row level security;

create policy "Users can view own wagers"
  on public.wagers for select
  using (auth.uid() = user_id);

create policy "Wagers on open markets are publicly viewable (amounts only)"
  on public.wagers for select using (true);

create policy "Authenticated users can insert wagers"
  on public.wagers for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.markets
      where id = market_id and status = 'open'
    )
  );

-- stop_stats
alter table public.stop_stats enable row level security;

create policy "Stop stats are viewable by everyone"
  on public.stop_stats for select using (true);
