const SEEN_LANDING_STORAGE_KEY = 'signal-problems:seen-landing'

/** True once this browser has been shown the marketing landing page before. */
export function hasSeenLanding(): boolean {
  try {
    return localStorage.getItem(SEEN_LANDING_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/** Marks the landing page as seen so future visits skip straight to the app. */
export function markLandingSeen(): void {
  try {
    localStorage.setItem(SEEN_LANDING_STORAGE_KEY, 'true')
  } catch {
    // localStorage unavailable (private browsing, etc.) — landing will show again next visit
  }
}
