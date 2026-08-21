import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { isMockMode, isRuntimeDemoMode, exitDemoMode } from '../lib/mock-mode'
import { useMyWagers } from '../hooks/use-profile'
import WagerHistory from '../components/wagers/WagerHistory'

interface StatusMsg {
  type: 'success' | 'error'
  text: string
}

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const wagersQuery = useMyWagers(user?.id)

  const [newEmail, setNewEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState<StatusMsg | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<StatusMsg | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const wagers = wagersQuery.data ?? []
  const settledWagers = wagers.filter((w) => w.payout !== null && w.payout !== w.amount)
  const netProfit = settledWagers.reduce((sum, w) => sum + (w.payout ?? 0) - w.amount, 0)
  const wins = settledWagers.filter((w) => (w.payout ?? 0) > 0).length

  async function handleUpdateEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newEmail.trim()) return
    setEmailLoading(true)
    setEmailMsg(null)

    if (isMockMode()) {
      setEmailLoading(false)
      setEmailMsg({ type: 'success', text: 'Demo mode — email changes are not saved.' })
      setNewEmail('')
      return
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() })
    setEmailLoading(false)
    if (error) {
      setEmailMsg({ type: 'error', text: error.message })
    } else {
      setEmailMsg({
        type: 'success',
        text: 'Confirmation link sent to your new address.',
      })
      setNewEmail('')
    }
  }

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    setPasswordLoading(true)
    setPasswordMsg(null)

    if (isMockMode()) {
      setPasswordLoading(false)
      setPasswordMsg({ type: 'success', text: 'Demo mode — password changes are not saved.' })
      setNewPassword('')
      setConfirmPassword('')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)
    if (error) {
      setPasswordMsg({ type: 'error', text: error.message })
    } else {
      setPasswordMsg({ type: 'success', text: 'Password updated.' })
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  async function handleSignOut() {
    if (isRuntimeDemoMode()) {
      exitDemoMode()
      return
    }
    await signOut()
    navigate('/login')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-7">
      <h1 className="text-xl font-bold tracking-tight">Settings</h1>

      {/* Account summary */}
      <section>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Account</p>
        <div className="card divide-y divide-gray-100">
          <Row label="Username">{profile?.username ?? '—'}</Row>
          <Row label="Email">{user?.email ?? '—'}</Row>
          <Row label="Balance">
            <span className="font-bold tabular-nums">
              {profile?.credits_balance.toLocaleString()} credits
            </span>
          </Row>
          <Row label="Net Profit">
            <span
              className={`font-bold tabular-nums ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {netProfit >= 0 ? '+' : ''}
              {netProfit.toLocaleString()}
            </span>
          </Row>
          {settledWagers.length > 0 && (
            <Row label="Win Rate">
              <span className="tabular-nums">
                {Math.round((wins / settledWagers.length) * 100)}%{' '}
                <span className="text-gray-400">
                  ({wins}/{settledWagers.length})
                </span>
              </span>
            </Row>
          )}
        </div>
      </section>

      {/* Change email */}
      <section>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
          Change Email
        </p>
        <form onSubmit={handleUpdateEmail} className="card px-4 py-4 space-y-3">
          <div>
            <label htmlFor="new-email" className="label">New email address</label>
            <input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="input"
              placeholder={user?.email}
            />
          </div>
          {emailMsg && (
            <p className={`text-sm ${emailMsg.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
              {emailMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={emailLoading || !newEmail.trim()}
            className="btn-primary"
          >
            {emailLoading ? 'Updating…' : 'Update Email'}
          </button>
        </form>
      </section>

      {/* Change password */}
      <section>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
          Change Password
        </p>
        <form onSubmit={handleUpdatePassword} className="card px-4 py-4 space-y-3">
          <div>
            <label htmlFor="new-password" className="label">New password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="label">Confirm password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="Repeat password"
            />
          </div>
          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
              {passwordMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={passwordLoading || !newPassword}
            className="btn-primary"
          >
            {passwordLoading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </section>

      {/* Wager history */}
      <section>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
          Wager History
        </p>
        <WagerHistory wagers={wagers} isLoading={wagersQuery.isLoading} />
      </section>

      {/* Sign out */}
      <section>
        <button onClick={handleSignOut} className="btn-danger w-full">
          {isRuntimeDemoMode() ? 'Exit demo' : 'Sign out'}
        </button>
      </section>
    </div>
  )
}

function Row({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5">
      <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  )
}
