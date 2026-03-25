import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import AppLayout from './components/layout/AppLayout'
import RequireAuth from './components/auth/RequireAuth'
import RequireUsername from './components/auth/RequireUsername'
import MarketsPage from './pages/MarketsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import UsernameSetupPage from './pages/UsernameSetupPage'
import MarketDetailPage from './pages/MarketDetailPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
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

        {/* App routes with nav */}
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <RequireAuth>
                <RequireUsername>
                  <MarketsPage />
                </RequireUsername>
              </RequireAuth>
            }
          />

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
    </AuthProvider>
  )
}
