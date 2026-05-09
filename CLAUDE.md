# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Signal Problems is a real-time prediction market game for NYC subway delays. Users wager credits on whether a train will arrive on time or late. Markets are generated from MTA GTFS-Realtime feeds via Supabase Edge Functions and settled automatically once actual arrival data is available.

## Commands

```sh
npm run dev          # dev server at http://localhost:5173
npm run build        # type-check + vite build
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

Set `VITE_MOCK_MODE=true` in `.env` to run without Supabase or real MTA data. In this mode `MockAuthProvider` (`src/mock/auth-provider.tsx`) replaces the real `AuthProvider`, and all hooks short-circuit to fixture data from `src/mock/data.ts`. This is the only way to develop without a Supabase project configured.

## Architecture

### Frontend (Vite + React 19 + TypeScript)

- **Routing**: `react-router-dom` v7. All routes defined in `src/App.tsx`. Auth guards are `RequireAuth` and `RequireUsername` wrapper components.
- **Auth**: `AuthContext` (`src/lib/auth-context.tsx`) provides session, profile, and auth methods. `useAuth()` hook is the access point throughout the app.
- **Data fetching**: TanStack Query (`@tanstack/react-query`). Each feature has a dedicated hook in `src/hooks/` (e.g. `use-markets.ts`, `use-market-detail.ts`, `use-place-wager.ts`). Hooks check `isMockMode()` and return fixture data instead of hitting Supabase when mock mode is active.
- **Styling**: Tailwind CSS v3. MTA line colors are defined as custom Tailwind config in `tailwind.config.js`. `LineBadge` (`src/components/mta/LineBadge.tsx`) is the canonical component for rendering subway line indicators.
- **UI primitives**: Radix UI (dialog, dropdown, label, slot, tabs, toast).

### Database (Supabase / Postgres)

Types are hand-written in `src/types/database.ts` — not auto-generated. Key tables:

| Table | Purpose |
|-------|---------|
| `profiles` | Extends `auth.users`; holds `username` and `credits_balance` (starts at 1,000) |
| `markets` | One row per train-at-stop prediction market; `status` transitions: `open → closed → settled/cancelled` |
| `wagers` | User predictions (`on_time` or `late`); `payout` is null until settled |
| `stop_stats` | Precomputed on-time rates per stop+route, used for market pricing |

Row Level Security is enabled on all tables. Edge functions run as the service role to write to `markets`.

### Edge Functions (Deno, in `supabase/functions/`)

- **`poll-mta`**: Fetches all MTA GTFS-Realtime feeds, builds market rows, upserts them, closes due markets, settles markets with known outcomes, and cancels stale ones. Intended to run on a schedule.
- **`settle-markets`**: Standalone settlement function.

Edge functions are tested by vitest (included via `supabase/functions/**/*.test.ts` glob in `vite.config.ts`).

### Scripts

`scripts/generate-mta-stations.mjs` — generates `src/lib/mta-stations.ts` (static station list). Run it manually if the station data needs updating.

## Environment variables

```
VITE_SUPABASE_URL=      # Required unless VITE_MOCK_MODE=true
VITE_SUPABASE_ANON_KEY= # Required unless VITE_MOCK_MODE=true
VITE_MOCK_MODE=true     # Disables all Supabase/MTA calls; uses fixture data
```
