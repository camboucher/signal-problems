import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { useProfile } from '../hooks/use-profile'
import WagerHistory from '../components/wagers/WagerHistory'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const { profileQuery, wagersQuery } = useProfile(username)

  if (profileQuery.isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-100 w-32" />
          <div className="card grid grid-cols-3 divide-x divide-gray-100">
            {Array.from({ length: 3 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className="px-4 py-3 text-center space-y-1.5">
                <div className="h-4 bg-gray-100 mx-auto w-12" />
                <div className="h-2 bg-gray-100 mx-auto w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (profileQuery.error || !profileQuery.data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-sm text-red-500 text-center py-16 border border-dashed border-red-100">
          User not found
        </div>
      </div>
    )
  }

  const profile = profileQuery.data
  const isOwnProfile = user?.id === profile.id
  const wagers = wagersQuery.data ?? []
  const settledWagers = wagers.filter((w) => w.payout !== null && w.payout !== w.amount)
  const netProfit = settledWagers.reduce((sum, w) => sum + (w.payout ?? 0) - w.amount, 0)
  const wins = settledWagers.filter((w) => (w.payout ?? 0) > 0).length
  const losses = settledWagers.filter((w) => w.payout === 0).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{profile.username}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Since{' '}
            {new Date(profile.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        {isOwnProfile && (
          <Link to="/settings" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
            Settings →
          </Link>
        )}
      </div>

      {/* Stats grid */}
      <div className="card grid grid-cols-3 divide-x divide-gray-100">
        <div className="px-4 py-3 text-center">
          <div className="text-sm font-bold tabular-nums">
            {profile.credits_balance.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Balance</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div
            className={`text-sm font-bold tabular-nums ${
              netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {netProfit >= 0 ? '+' : ''}
            {netProfit.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Net Profit</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-sm font-bold tabular-nums">
            {settledWagers.length === 0
              ? '—'
              : `${Math.round((wins / settledWagers.length) * 100)}%`}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Win Rate</div>
        </div>
      </div>

      {settledWagers.length > 0 && (
        <p className="text-[10px] text-gray-400 text-right mt-1 tabular-nums">
          {wins}W / {losses}L across {settledWagers.length} settled wager{settledWagers.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Wager history */}
      <div className="mt-6">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
          Recent Wagers
        </p>
        <WagerHistory
          wagers={wagers}
          isLoading={wagersQuery.isLoading}
          emptyMessage={`${profile.username} hasn't placed any wagers yet`}
        />
      </div>
    </div>
  )
}
