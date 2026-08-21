import { useState } from 'react'
import { currentTheme, setTheme, type Theme } from '../../lib/theme'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  )
}

export default function ThemeToggle({
  className = '',
  dark = false,
}: {
  readonly className?: string
  /** Set when placed on the fixed-dark "signage" chrome (e.g. Navbar), which
   *  doesn't participate in the light/dark toggle itself. */
  readonly dark?: boolean
}) {
  const [theme, setThemeState] = useState<Theme>(() => currentTheme())

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setThemeState(next)
  }

  const colorClass = dark
    ? 'text-[#8b8d9e] hover:text-[#e9e9ed]'
    : 'text-sp-dim hover:text-sp-text'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`transition-colors ${colorClass} ${className}`}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
