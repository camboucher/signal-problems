import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import AuthShell from '../components/layout/AuthShell'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const { error, needsConfirmation } = await signUp(email, password)
    setLoading(false)

    if (error) {
      setError(error.message)
    } else if (needsConfirmation) {
      setSuccess(true)
    } else {
      // Email confirmation is off, so the user is already signed in.
      // RequireUsername sends them on to /setup-username from here.
      navigate('/', { replace: true })
    }
  }

  if (success) {
    return (
      <AuthShell kicker="Almost there" title="Check your email">
        <p className="text-sm text-sp-dim leading-relaxed">
          We sent a link to <span className="font-medium text-sp-text">{email}</span>. Click it to
          finish signing up and grab your 1,000 credits.
        </p>
        <p className="text-sm text-sp-dim mt-6">
          Already clicked it?{' '}
          <Link to="/login" className="text-sp-accent font-medium underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      kicker="All aboard"
      title="Make an account"
      subtitle={
        <>
          You'll start with <span className="font-semibold text-sp-led">1,000 play credits</span>.
        </>
      }
    >

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
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="label">Confirm password</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-sm text-sp-very bg-sp-very/10 border border-sp-very/30 px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'One sec…' : 'Sign up'}
          </button>
        </form>

        <p className="text-xs text-sp-dim mt-4 leading-relaxed">
          Credits are just for fun. They aren't worth real money and you can't buy more.
        </p>

        <p className="text-sm text-sp-dim mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-sp-accent font-medium underline underline-offset-2">
            Sign in
          </Link>
        </p>
    </AuthShell>
  )
}
