import { useAuth } from '../lib/auth-context'

export default function MarketsPage() {
  const { profile } = useAuth()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold tracking-tight">Markets</h1>
        {profile && (
          <span className="text-sm font-medium tabular-nums">
            {profile.credits_balance.toLocaleString()} credits
          </span>
        )}
      </div>

      <div className="text-sm text-gray-400 text-center py-16 border border-dashed border-gray-200">
        Markets feed coming in Phase 2 (MTA integration)
      </div>
    </div>
  )
}
