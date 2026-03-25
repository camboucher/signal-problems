import { NavLink } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'

function IconTrains({ active }: { readonly active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={active ? 2.5 : 1.75}
      stroke="currentColor"
      className="w-5 h-5"
    >
      {/* Subway car silhouette */}
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="7.5" cy="19" r="1.5" />
      <circle cx="16.5" cy="19" r="1.5" />
      <line x1="7.5" y1="17" x2="7.5" y2="17.5" />
      <line x1="16.5" y1="17" x2="16.5" y2="17.5" />
    </svg>
  )
}

function IconLeaderboard({ active }: { readonly active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={active ? 2.5 : 1.75}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function IconProfile({ active }: { readonly active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={active ? 2.5 : 1.75}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
    </svg>
  )
}

function IconSettings({ active }: { readonly active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={active ? 2.5 : 1.75}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export default function BottomNav() {
  const { user, profile } = useAuth()
  const profilePath = user ? `/profile/${profile?.username ?? user.id}` : '/login'

  const linkClass = (isActive: boolean) =>
    `flex flex-col items-center gap-0.5 pt-2 pb-1 px-3 transition-colors ${
      isActive ? 'text-gray-950' : 'text-gray-400'
    }`
  const labelClass = 'text-[9px] font-bold uppercase tracking-widest'

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-20 flex justify-around safe-bottom">
      <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
        {({ isActive }) => (
          <>
            <IconTrains active={isActive} />
            <span className={labelClass}>Trains</span>
          </>
        )}
      </NavLink>

      <NavLink to="/leaderboard" className={({ isActive }) => linkClass(isActive)}>
        {({ isActive }) => (
          <>
            <IconLeaderboard active={isActive} />
            <span className={labelClass}>Leaders</span>
          </>
        )}
      </NavLink>

      <NavLink to={profilePath} className={({ isActive }) => linkClass(isActive)}>
        {({ isActive }) => (
          <>
            <IconProfile active={isActive} />
            <span className={labelClass}>{profile?.username ? 'Me' : 'Profile'}</span>
          </>
        )}
      </NavLink>

      <NavLink to="/settings" className={({ isActive }) => linkClass(isActive)}>
        {({ isActive }) => (
          <>
            <IconSettings active={isActive} />
            <span className={labelClass}>Settings</span>
          </>
        )}
      </NavLink>
    </nav>
  )
}
