import { useParams, Link } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import { useAuth } from '../lib/auth-context'
import { useProfile } from '../hooks/use-profile'
import { useProfileStats } from '../hooks/use-profile-stats'
import WagerHistory from '../components/wagers/WagerHistory'
import StatCard from '../components/stats/StatCard'
import LineBreakdownTable from '../components/stats/LineBreakdownTable'
import TimeOfDayChart from '../components/stats/TimeOfDayChart'

const MIN_SETTLED_FOR_STATS = 5

function ProfileStats({ wagers, isLoading }: {
  wagers: ReturnType<typeof useProfile>['wagersQuery']['data']
  isLoading: boolean
}) {
  const stats = useProfileStats(wagers ?? [])
  const settled = (wagers ?? []).filter((w) => w.markets.status === 'settled' && w.payout !== null)

  if (isLoading) {
    return <div className="text-sm text-gray-400 text-center py-12">Loading stats…</div>
  }

  if (settled.length < MIN_SETTLED_FOR_STATS) {
    return (
      <div className="text-sm text-gray-400 text-center py-12 border border-dashed border-gray-200">
        Place more wagers to see your stats
        <p className="text-xs mt-1">({MIN_SETTLED_FOR_STATS - settled.length} more settled wager{MIN_SETTLED_FOR_STATS - settled.length !== 1 ? 's' : ''} needed)</p>
      </div>
    )
  }

  const roiLabel = stats.streak.type
    ? `${stats.streak.current} ${stats.streak.type}${stats.streak.current !== 1 ? 's' : ''}`
    : '—'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Avg Wager"
          value={Math.round(stats.avgWagerSize).toLocaleString()}
        />
        <StatCard
          label="Current Streak"
          value={roiLabel}
          valueClass={stats.streak.type === 'win' ? 'text-emerald-600' : stats.streak.type === 'loss' ? 'text-red-500' : ''}
        />
        <StatCard
          label="Longest Streak"
          value={stats.streak.longest > 0 ? `${stats.streak.longest}` : '—'}
        />
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">ROI by Line</p>
        <div className="card px-4 py-3">
          <LineBreakdownTable lines={stats.roiByLine} />
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Win Rate by Time of Day</p>
        <div className="card px-4 py-4">
          <TimeOfDayChart data={stats.winRateByTimeOfDay} />
        </div>
      </div>
    </div>
  )
}

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

      {/* Tabs */}
      <div className="mt-6">
        <Tabs.Root defaultValue="history">
          <Tabs.List className="flex gap-4 border-b border-gray-100 mb-4">
            <Tabs.Trigger
              value="history"
              className="text-xs font-medium uppercase tracking-wide pb-2 text-gray-400 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 transition-colors"
            >
              Wager History
            </Tabs.Trigger>
            {isOwnProfile && (
              <Tabs.Trigger
                value="stats"
                className="text-xs font-medium uppercase tracking-wide pb-2 text-gray-400 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 transition-colors"
              >
                Stats
              </Tabs.Trigger>
            )}
          </Tabs.List>

          <Tabs.Content value="history">
            <WagerHistory
              wagers={wagers}
              isLoading={wagersQuery.isLoading}
              emptyMessage={`${profile.username} hasn't placed any wagers yet`}
            />
          </Tabs.Content>

          {isOwnProfile && (
            <Tabs.Content value="stats">
              <ProfileStats wagers={wagersQuery.data} isLoading={wagersQuery.isLoading} />
            </Tabs.Content>
          )}
        </Tabs.Root>
      </div>
    </div>
  )
}
