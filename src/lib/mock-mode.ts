const DEMO_MODE_STORAGE_KEY = 'signal-problems:demo-mode'

/** True at build time when the whole app was compiled with `VITE_MOCK_MODE=true` (local dev). */
function isBuildTimeMockMode(): boolean {
  return import.meta.env.VITE_MOCK_MODE === 'true'
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** True when a visitor opted into the in-browser demo via `enterDemoMode()`. */
export function isRuntimeDemoMode(): boolean {
  return !isBuildTimeMockMode() && readStorage(DEMO_MODE_STORAGE_KEY) === 'true'
}

/** True when the app should use fixture data instead of Supabase/MTA — either because it was
 *  built with `VITE_MOCK_MODE=true`, or because a visitor opted into the runtime demo. */
export function isMockMode(): boolean {
  return isBuildTimeMockMode() || isRuntimeDemoMode()
}

/** Opts the current browser into demo mode and reloads into the app. */
export function enterDemoMode(): void {
  try {
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, 'true')
  } catch {
    // localStorage unavailable (private browsing, etc.) — demo mode won't persist across reloads
  }
  window.location.assign('/')
}

/** Leaves demo mode and returns to the real sign-in page. */
export function exitDemoMode(): void {
  try {
    localStorage.removeItem(DEMO_MODE_STORAGE_KEY)
  } catch {
    // no-op
  }
  window.location.assign('/login')
}
