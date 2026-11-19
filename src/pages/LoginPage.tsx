import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { markLandingSeen } from '../lib/ftue'
import AuthShell from '../components/layout/AuthShell'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <AuthShell kicker="Welcome back" title="Sign in" subtitle="Your trains are waiting. Probably late.">

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-sp-very bg-sp-very/10 border border-sp-very/30 px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-sp-dim mt-6 text-center">
          New here?{' '}
          <Link to="/signup" className="text-sp-accent font-medium underline underline-offset-2">
            Make an account
          </Link>
        </p>

        <p className="text-sm text-sp-dim mt-6 pt-6 border-t border-sp-edge text-center">
          Just looking?{' '}
          <Link
            to="/"
            onClick={markLandingSeen}
            className="text-sp-accent font-medium underline underline-offset-2"
          >
            Browse the trains
          </Link>{' '}
          without an account.
        </p>
    </AuthShell>
  )
}
