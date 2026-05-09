alter table public.profiles
  add column favorite_stop_ids text[] not null default '{}'::text[];
