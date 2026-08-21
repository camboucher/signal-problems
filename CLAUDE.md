# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Signal Problems is a real-time prediction market game for NYC subway delays. Users wager credits on whether a train will arrive `on_time`, `late`, or `very_late`, at odds priced from historical on-time rates. Markets are generated from MTA GTFS-Realtime feeds via Supabase Edge Functions and settled automatically once actual arrival data is available.

## Commands

```sh
npm run dev          # dev server at http://localhost:5173
npm run build        # type-check (tsc -b) + vite build
npm run lint         # eslint
npm run test         # vitest run (single pass)
npm run test:watch   # vitest watch mode
```

Run a single test file:
```sh
npx vitest run src/components/markets/MarketCard.test.tsx
```

Run tests matching a name pattern:
```sh
npx vitest run -t "filter"
```

## Mock mode

Set `VITE_MOCK_MODE=true` in `.env` to run without Supabase or real MTA data. In this mode `MockAuthProvider` (`src/mock/auth-provider.tsx`) replaces the real `AuthProvider`, and all hooks short-circuit to fixture data from `src/mock/data.ts`. Data hooks check `isMockMode()` (`src/lib/mock-mode.ts`) individually rather than through a global client swap, so any new hook that talks to Supabase needs its own mock-mode branch (see `use-place-wager.ts` or `use-favorite-stops.ts` for the pattern). This is the only way to develop without a Supabase project configured.

## Architecture

### Frontend (Vite + React 19 + TypeScript)

- **Routing**: `react-router-dom` v7. All routes defined in `src/App.tsx`. Auth guards are `RequireAuth` and `RequireUsername` wrapper components. Most pages are lazy-loaded; `MarketsPage` (the `/` route) loads eagerly.
- **Auth**: `AuthContext` (`src/lib/auth-context.tsx`) provides session, profile, and auth methods. `useAuth()` hook is the access point throughout the app.
- **Data fetching**: TanStack Query (`@tanstack/react-query`). Each feature has a dedicated hook in `src/hooks/` (e.g. `use-markets.ts`, `use-market-detail.ts`, `use-place-wager.ts`, `use-favorite-stops.ts`, `use-profile-stats.ts`, `use-user-location.ts`). Hooks check `isMockMode()` and return fixture data instead of hitting Supabase when mock mode is active.
- **Geolocation**: `use-user-location.ts` reads the browser Geolocation API; `src/lib/nearby-stops.ts` does haversine-distance station matching against the static station list to power the nearby-trains view on `MarketsPage` and partitions markets into nearby vs. all.
- **Styling**: Tailwind CSS v3. MTA line colors are defined as custom Tailwind config in `tailwind.config.js`. `LineBadge` (`src/components/mta/LineBadge.tsx`) is the canonical component for rendering subway line indicators.
- **UI primitives**: Radix UI (dialog, dropdown, label, slot, tabs, toast).

### Betting model

Markets price three outcome tiers, not a binary on-time/late split:

- `on_time` — predicted arrival within 5 minutes of scheduled
- `late` — 5–20 minutes late
- `very_late` — more than 20 minutes late

Odds (`on_time_odds`, `late_odds`, `very_late_odds`) are computed once per market at creation time in Postgres (`odds_for_stop`, in the `dynamic_odds` migration) from that stop+route's `stop_stats.on_time_rate`, with a 5% vig and odds clamped to `[1.1, 15.0]`. Odds are locked at market creation and do not move afterward — `upsert_markets` only refreshes `latest_predicted_arrival` on conflict. A wager stores the `odds_accepted` at the time it was placed; payout on settlement is `round(amount * odds_accepted)` for a winning prediction, `0` otherwise. This means older/legacy wagers (pre-odds) default to 2.0 (equivalent to the old flat 50/50 payout).

### Database (Supabase / Postgres)

Types are hand-written in `src/types/database.ts` — not auto-generated, so schema changes require updating both a migration and this file by hand. Key tables:

| Table | Purpose |
|-------|---------|
| `profiles` | Extends `auth.users`; holds `username`, `credits_balance` (starts at 1,000), and `favorite_stop_ids` (text array, no separate join table) |
| `markets` | One row per train-at-stop prediction market; `status` transitions: `open → closed → settled/cancelled`; carries locked-in odds for all three outcome tiers |
| `wagers` | User predictions (`on_time` / `late` / `very_late`) with `odds_accepted`; `payout` is null until settled |
| `stop_stats` | Precomputed on-time rates per stop+route, updated after every settlement via a weighted running average; used to price new markets |

Row Level Security is enabled on all tables. Edge functions run as the service role to write to `markets`. Migrations live in `supabase/migrations/`, applied in filename (timestamp) order — treat them as an append-only log; don't edit an already-applied migration, add a new one.

### Edge Functions (Deno, in `supabase/functions/`)

- **`poll-mta`**: Fetches all MTA GTFS-Realtime feeds, decodes GTFS protobuf, builds market rows, upserts them via `upsert_markets` (which prices new markets through `odds_for_stop`), closes due markets, settles markets with known outcomes, and cancels stale ones. Intended to run on a schedule.
- **`settle-markets`**: Standalone settlement function, calls the same `settle_markets()` Postgres function as `poll-mta`'s settlement step (three-tier outcome resolution, odds-based payouts, `stop_stats` update).

Edge functions are tested by vitest (included via `supabase/functions/**/*.test.ts` glob in `vite.config.ts`).

### Scripts

`scripts/generate-mta-stations.mjs` — generates `src/lib/mta-stations.ts` (static station list, including lat/lon used by the nearby-stops geolocation matching). Run it manually if the station data needs updating.

## Environment variables

```
VITE_SUPABASE_URL=      # Required unless VITE_MOCK_MODE=true
VITE_SUPABASE_ANON_KEY= # Required unless VITE_MOCK_MODE=true
VITE_MOCK_MODE=true     # Disables all Supabase/MTA calls; uses fixture data
```
