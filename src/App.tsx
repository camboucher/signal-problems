import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import AppLayout from './components/layout/AppLayout'
import RequireAuth from './components/auth/RequireAuth'
import RequireUsername from './components/auth/RequireUsername'
import MarketsPage from './pages/MarketsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import UsernameSetupPage from './pages/UsernameSetupPage'
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

          {/* Placeholder routes — implemented in later phases */}
          <Route path="/leaderboard" element={<ComingSoon title="Leaderboard" />} />
          <Route path="/market/:id" element={<ComingSoon title="Market" />} />
          <Route path="/profile/:username" element={<ComingSoon title="Profile" />} />
          <Route path="/settings" element={<ComingSoon title="Settings" />} />
          <Route path="/about" element={<ComingSoon title="About" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold tracking-tight mb-6">{title}</h1>
      <div className="text-sm text-gray-400 text-center py-16 border border-dashed border-gray-200">
        Coming in a future phase
      </div>
    </div>
  )
}
