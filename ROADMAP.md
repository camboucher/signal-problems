# Roadmap

Working notes on what's shipped, what's next, and known gaps. Not a promise of order — pull from whichever section makes sense next.

## Shipped

- **Landing page as a first-time-user-experience, demo mode hidden from the UI** (2026-08-22) — `/` now shows the marketing `LandingPage` only once per browser: `src/lib/ftue.ts` (`hasSeenLanding`/`markLandingSeen`) gates it via `localStorage`, and `HomeRoute` in `src/App.tsx` falls through to the real spectator `MarketsPage` for anon on every visit after the first, same as it already did for signed-in users. `LandingPage` marks itself seen on mount; the sign-in page's "Explore markets" link marks it explicitly too (since a visitor can land there without ever seeing `/`). Replaced all "Try the demo"/"Enter the demo" CTAs (three on `LandingPage`, one on `LoginPage`) with "Sign up" + "Explore markets" — spectator mode now covers the "just looking" use case with real data, so the fixture-data demo funnel didn't need top billing. `enterDemoMode`/`exitDemoMode`/`isMockMode` in `src/lib/mock-mode.ts` are untouched — `VITE_MOCK_MODE=true` local dev and any already-active runtime demo session still work identically; only the UI entry points into it were removed. Reversible: re-add a button calling `enterDemoMode` to bring it back.
- **Spectator-mode cleanup** (2026-08-22) — audited every page/component for anon (`!user`) behavior; turns out `MarketsPage`, `MarketDetailPage`, `LeaderboardPage`, and `ProfilePage` were already anon-safe (RLS already allows public `select` on `markets`/`profiles`/`wagers`/`stop_stats`, and none of those routes are `RequireAuth`-gated — only `/settings` and `/setup-username` are). Fixed the two real gaps: `BottomNav` (`src/components/layout/BottomNav.tsx`) showed a "Settings" tab for anon that just bounced through `/settings` → `/login`, now shows "Sign in" directly; `MarketCard`'s favorite star (`src/components/markets/MarketCard.tsx`) silently disappeared for anon, now shows dimmed and routes to `/login` on click instead of vanishing.
- **Odds explainer on `MarketDetailPage`** (2026-08-22) — collapsible "How these odds are calculated" card (`src/components/markets/OddsExplainer.tsx`) showing the historical on-time rate, the on_time/late/very_late probability split, and the locked-in odds per tier, mirroring the exact formula from `odds_for_stop` in `supabase/migrations/20260319000001_dynamic_odds.sql` (75/25 split of the remaining probability, 5% vig, clamp to [1.1, 15.0]). Falls back to the same 70% baseline the SQL uses when a stop+route has no `stop_stats` row yet.
- **CI + working `npm run lint`** (2026-08-22) — added `eslint.config.js` (flat config, was missing despite eslint deps being installed); the four stray `eslint-disable-next-line react/no-array-index-key` comments were referencing an uninstalled plugin and erroring lint outright, removed them; two `_`-prefixed intentionally-unused vars now allowed via `argsIgnorePattern`/`varsIgnorePattern`. Added `.github/workflows/ci.yml` running `lint`, `test`, `build` on PRs to `main` (Node 20).
- **Demo mode** (2026-08-21) — runtime-toggled via a "Try the live demo" link on the sign-in page (`src/lib/mock-mode.ts`, `enterDemoMode`/`exitDemoMode`). No separate deployment needed: one visitor can flip into fixture data via `localStorage` while the rest of the app still talks to real Supabase. Fixed `SettingsPage` so its email/password forms don't hit the real Supabase project while in demo mode.
- **README overhaul** (2026-08-21) — screenshots, feature list, tech stack, quickstart.
- **`.env.example`** (2026-08-21) — `SETUP.md` referenced it via `cp .env.example .env` but it never existed in the repo.
- Three-tier odds/settlement system (`on_time` / `late` / `very_late`), dynamic odds priced from `stop_stats`, geolocation-based nearby trains, favorite stops, profile stats (ROI by line, streaks, time-of-day win rate).

## Now / Next

- **Historical/settled markets feed** — a browsable list of resolved predictions and outcomes, so the game's mechanics are visible end-to-end without placing a wager.

## Later / known gaps

- **Hand-written DB types** (`src/types/database.ts`) — noted in `SETUP.md` as "replace with generated types later." Consider `supabase gen types typescript` once schema churn slows down.
- **Main JS chunk is 500KB+** — `vite build` warns about this (`index-*.js`). Most routes are already lazy-loaded except `MarketsPage`; look at what's pulling size into the shared chunk (Supabase client? Radix?) before code-splitting further.
- **Mock-mode-unaware code paths** — `SettingsPage` needed a fix; worth a sweep for any other component that calls `supabase` directly instead of going through a hook that checks `isMockMode()`.
