import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { isRuntimeDemoMode, exitDemoMode } from '../../lib/mock-mode'
import ThemeToggle from './ThemeToggle'

// This header is a fixed "signage" bar — like a real subway sign, it stays
// dark regardless of the app's light/dark theme — so colors here are
// hardcoded rather than pulled from the theme-reactive sp-* tokens.
function navLinkClass({ isActive }: { isActive: boolean }) {
  return `text-sm font-medium transition-colors ${isActive ? 'text-[#e9e9ed]' : 'text-[#8b8d9e] hover:text-[#9184d9]'}`
}

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    if (isRuntimeDemoMode()) {
      exitDemoMode()
      return
    }
    await signOut()
    navigate('/login')
  }

  return (
    <header className="bg-[#0c0d12] border-b-[3px] border-[#ffb800] sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-6 h-6 rounded-full bg-[#ffb800] text-[#0c0d12] inline-flex items-center justify-center text-xs font-bold">
            S
          </span>
          <span className="font-bold tracking-widest text-xs uppercase text-[#e9e9ed]">
            Signal Problems
          </span>
        </Link>

        <div className="flex-1" />

        {/* Desktop nav — hidden on mobile (replaced by bottom nav) */}
        <nav className="hidden sm:flex items-center gap-5">
          <NavLink to="/" end className={navLinkClass}>
            Trains
          </NavLink>
          <NavLink to="/leaderboard" className={navLinkClass}>
            Leaderboard
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>

          {user ? (
            <>
              <NavLink
                to={`/profile/${profile?.username ?? user.id}`}
                className={navLinkClass}
              >
                {profile?.username ?? 'Profile'}
              </NavLink>
              <NavLink to="/settings" className={navLinkClass}>
                Settings
              </NavLink>
              <button
                onClick={handleSignOut}
                className="text-sm text-[#8b8d9e] hover:text-[#ff5247] transition-colors"
              >
                {isRuntimeDemoMode() ? 'Exit demo' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Sign in
              </NavLink>
              <NavLink
                to="/signup"
                className="text-xs font-bold uppercase tracking-wide border border-[#9184d9] text-[#9184d9] px-3 py-1.5 hover:bg-[#9184d9]/10 transition-colors"
              >
                Sign up
              </NavLink>
            </>
          )}
        </nav>

        <ThemeToggle className="hidden sm:inline-flex" dark />

        {/* Mobile: show auth state inline since bottom nav handles navigation */}
        <div className="sm:hidden flex items-center gap-3">
          {user ? (
            <span className="text-xs font-bold tabular-nums text-[#ffb800]">
              {profile?.credits_balance?.toLocaleString()} cr
            </span>
          ) : (
            <NavLink
              to="/signup"
              className="text-xs font-bold uppercase tracking-wide border border-[#9184d9] text-[#9184d9] px-3 py-1.5"
            >
              Sign up
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
