import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth-context'
import { MockAuthProvider } from './mock/auth-provider'
import { isMockMode } from './lib/mock-mode'
import AppLayout from './components/layout/AppLayout'
import RequireAuth from './components/auth/RequireAuth'
import RequireUsername from './components/auth/RequireUsername'
import MarketsPage from './pages/MarketsPage'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const UsernameSetupPage = lazy(() => import('./pages/UsernameSetupPage'))
const MarketDetailPage = lazy(() => import('./pages/MarketDetailPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))

function PageLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <span className="text-sm text-gray-400">Loading…</span>
    </div>
  )
}

const AppAuthProvider = isMockMode() ? MockAuthProvider : AuthProvider

/** `/` shows the public marketing page to signed-out visitors, and the
 *  trains list (inside the normal app chrome) to signed-in users. */
function HomeRoute() {
  const { user, loading } = useAuth()

  if (loading) return <PageLoading />
  if (!user) return <LandingPage />

  return (
    <AppLayout>
      <RequireUsername>
        <MarketsPage />
      </RequireUsername>
    </AppLayout>
  )
}

export default function App() {
  return (
    <AppAuthProvider>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Username setup — requires auth, no username yet */}
          <Route
            path="/setup-username"
            element={
              <RequireAuth>
                <UsernameSetupPage />
              </RequireAuth>
            }
          />

          {/* Public marketing page (signed out) / trains list (signed in) */}
          <Route path="/" element={<HomeRoute />} />

          {/* App routes with nav */}
          <Route element={<AppLayout />}>
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/market/:id" element={<MarketDetailPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <SettingsPage />
                </RequireAuth>
              }
            />
            <Route path="/about" element={<AboutPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppAuthProvider>
  )
}
