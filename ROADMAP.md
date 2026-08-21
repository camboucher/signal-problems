# Roadmap

Working notes on what's shipped, what's next, and known gaps. Not a promise of order — pull from whichever section makes sense next.

## Shipped

- **Demo mode** (2026-08-21) — runtime-toggled via a "Try the live demo" link on the sign-in page (`src/lib/mock-mode.ts`, `enterDemoMode`/`exitDemoMode`). No separate deployment needed: one visitor can flip into fixture data via `localStorage` while the rest of the app still talks to real Supabase. Fixed `SettingsPage` so its email/password forms don't hit the real Supabase project while in demo mode.
- **README overhaul** (2026-08-21) — screenshots, feature list, tech stack, quickstart.
- **`.env.example`** (2026-08-21) — `SETUP.md` referenced it via `cp .env.example .env` but it never existed in the repo.
- Three-tier odds/settlement system (`on_time` / `late` / `very_late`), dynamic odds priced from `stop_stats`, geolocation-based nearby trains, favorite stops, profile stats (ROI by line, streaks, time-of-day win rate).

## Now / Next

- **CI** — no `.github/workflows`. Add a workflow that runs `lint`, `test`, and `build` on PRs. High trust signal for a portfolio repo, low effort.
- **Fix `npm run lint`** — currently fails outright: there's no `eslint.config.js` in the repo despite `eslint`/`typescript-eslint`/`eslint-plugin-react-hooks` being devDependencies. Needs a flat config before CI can enforce it.
- **Public/spectator mode** — right now `/` requires auth (`RequireAuth` wraps `MarketsPage`). Consider letting anyone browse open markets and odds without an account, gating only wagering behind sign-in. Shows off the odds engine to a visitor immediately instead of behind a login wall.
- **Odds explainer on `MarketDetailPage`** — surface the `stop_stats.on_time_rate` and vig math behind a market's odds. Makes the most sophisticated part of the system (dynamic pricing) visible instead of a black box.
- **Historical/settled markets feed** — a browsable list of resolved predictions and outcomes, so the game's mechanics are visible end-to-end without placing a wager.

## Later / known gaps

- **Hand-written DB types** (`src/types/database.ts`) — noted in `SETUP.md` as "replace with generated types later." Consider `supabase gen types typescript` once schema churn slows down.
- **Main JS chunk is 500KB+** — `vite build` warns about this (`index-*.js`). Most routes are already lazy-loaded except `MarketsPage`; look at what's pulling size into the shared chunk (Supabase client? Radix?) before code-splitting further.
- **Mock-mode-unaware code paths** — `SettingsPage` needed a fix; worth a sweep for any other component that calls `supabase` directly instead of going through a hook that checks `isMockMode()`.
