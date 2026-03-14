import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
        <Link to="/" className="font-bold tracking-tight text-sm">
          SIGNAL PROBLEMS
        </Link>

        <nav className="flex items-center gap-4">
          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'text-gray-950 font-medium' : 'text-gray-500 hover:text-gray-950'}`
            }
          >
            Leaderboard
          </NavLink>

          {user ? (
            <>
              <NavLink
                to={`/profile/${profile?.username ?? user.id}`}
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-gray-950 font-medium' : 'text-gray-500 hover:text-gray-950'}`
                }
              >
                {profile?.username ?? 'Profile'}
              </NavLink>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-950"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-sm text-gray-500 hover:text-gray-950"
              >
                Sign in
              </NavLink>
              <NavLink
                to="/signup"
                className="btn-primary text-xs px-3 py-1.5"
              >
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
