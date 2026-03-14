# Signal Problems — Setup Guide

## Prerequisites

- Node 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) — `brew install supabase/tap/supabase`
- A Supabase cloud project (or local dev stack)

---

## 1. Install dependencies

```sh
npm install
```

## 2. Configure environment

```sh
cp .env.example .env
```

Fill in your values from the Supabase project dashboard → Settings → API:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## 3. Apply the database migrations

### Option A — Supabase cloud (recommended for first-time setup)

```sh
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

### Option B — Local development stack

```sh
supabase start          # starts Postgres + Auth + Studio locally
supabase db reset       # applies all migrations from supabase/migrations/
```

Local Studio runs at http://127.0.0.1:54323  
Local API runs at http://127.0.0.1:54321

When using local Supabase, set `.env`:
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key printed by `supabase start`>
```

---

## 4. Run the dev server

```sh
npm run dev
```

App runs at http://localhost:5173

---

## Database schema (Phase 1)

| Table | Description |
|-------|-------------|
| `profiles` | Extends `auth.users`; holds `username` and `credits_balance` |
| `markets` | One row per train-at-stop prediction market |
| `wagers` | User predictions; `payout` null until settled |
| `stop_stats` | Precomputed on-time rates per stop+route |

### Key behaviors
- **1,000 credits issued automatically** via `handle_new_user` trigger when a user signs up
- `updated_at` auto-maintained via triggers on `profiles`, `markets`, `stop_stats`
- Row Level Security enabled on all tables; users can only modify their own data
- Service role (edge functions) is required to write to `markets`

---

## Auth flow

1. User signs up → email confirmation sent → `handle_new_user` trigger creates profile with 1,000 credits
2. On first login, user is redirected to `/setup-username` to pick a handle
3. All market/wager pages require authentication

---

## Project structure

```
src/
  components/
    auth/        RequireAuth, RequireUsername guards
    layout/      Navbar, AppLayout
  lib/
    auth-context.tsx   React context + hooks for session & profile
    supabase.ts        Typed Supabase client
  pages/         LoginPage, SignupPage, UsernameSetupPage, MarketsPage, …
  types/
    database.ts  Hand-written Supabase DB types (replace with generated types later)

supabase/
  config.toml          Local dev config
  migrations/
    20260314000001_init.sql   Tables, triggers, RLS policies
```
