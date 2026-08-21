export type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'signal-problems:theme'

export function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    return v === 'dark' || v === 'light' ? v : null
  } catch {
    return null
  }
}

/** Applies the given theme to the document root. Pass `null` to clear any
 *  explicit override and fall back to the OS `prefers-color-scheme`. */
export function applyTheme(theme: Theme | null): void {
  if (theme) {
    document.documentElement.dataset.theme = theme
  } else {
    delete document.documentElement.dataset.theme
  }
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // localStorage unavailable — theme choice just won't persist
  }
  applyTheme(theme)
}

function systemPrefersLight(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: light)').matches
  )
}

export function currentTheme(): Theme {
  return getStoredTheme() ?? (systemPrefersLight() ? 'light' : 'dark')
}

export function toggleTheme(): void {
  setTheme(currentTheme() === 'dark' ? 'light' : 'dark')
}

/** Call once at startup so the root attribute is set before first paint. */
export function initTheme(): void {
  applyTheme(getStoredTheme())
}
