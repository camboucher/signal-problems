import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { isRuntimeDemoMode, exitDemoMode } from '../../lib/mock-mode'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `text-sm transition-colors ${isActive ? 'text-gray-950 font-medium' : 'text-gray-500 hover:text-gray-950'}`
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
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
        <Link to="/" className="font-bold tracking-tight text-sm">
          SIGNAL PROBLEMS
        </Link>

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
                className="text-sm text-gray-400 hover:text-gray-950 transition-colors"
              >
                {isRuntimeDemoMode() ? 'Exit demo' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Sign in
              </NavLink>
              <NavLink to="/signup" className="btn-primary text-xs px-3 py-1.5">
                Sign up
              </NavLink>
            </>
          )}
        </nav>

        {/* Mobile: show auth state inline since bottom nav handles navigation */}
        <div className="sm:hidden flex items-center gap-3">
          {user ? (
            <span className="text-xs text-gray-400 tabular-nums">
              {profile?.credits_balance?.toLocaleString()} cr
            </span>
          ) : (
            <NavLink to="/signup" className="btn-primary text-xs px-3 py-1.5">
              Sign up
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
