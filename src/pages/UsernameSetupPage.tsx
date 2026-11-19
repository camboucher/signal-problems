import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import AuthShell from '../components/layout/AuthShell'

export default function UsernameSetupPage() {
  const { updateUsername } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(username)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setError(null)
    setLoading(true)
    const { error } = await updateUsername(username)
    setLoading(false)
    if (error) {
      setError(error.message.includes('unique') ? 'That username is taken' : error.message)
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <AuthShell kicker="Last stop" title="Pick a username" subtitle="This is what everyone sees on the leaderboard.">

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="label">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase())}
              className="input"
              placeholder="subway_oracle"
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              required
              autoComplete="off"
              autoFocus
            />
            <p className="text-xs text-sp-dim mt-1">
              3 to 20 characters. Letters, numbers, and underscores.
            </p>
          </div>

          {error && (
            <p className="text-sm text-sp-very bg-sp-very/10 border border-sp-very/30 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || !isValid}
          >
            {loading ? 'Saving…' : "Let's go"}
          </button>
        </form>
    </AuthShell>
  )
}
