import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Pick a username</h1>
          <p className="text-sm text-gray-500 mt-1">
            This is how you'll appear on the leaderboard
          </p>
        </div>

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
            <p className="text-xs text-gray-400 mt-1">
              3–20 characters, letters, numbers, and underscores only
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
            {loading ? 'Saving…' : 'Set username'}
          </button>
        </form>
      </div>
    </div>
  )
}
