import { Navigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'

export default function RequireUsername({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) return null

  if (user && profile && !profile.username) {
    return <Navigate to="/setup-username" replace />
  }

  return <>{children}</>
}
