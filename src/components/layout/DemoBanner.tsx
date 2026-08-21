import { isMockMode, isRuntimeDemoMode, exitDemoMode } from '../../lib/mock-mode'

export default function DemoBanner() {
  if (!isMockMode()) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs sm:text-sm px-4 py-2 text-center">
      You're viewing a live demo with sample data — wagers and edits aren't saved.
      {isRuntimeDemoMode() && (
        <>
          {' '}
          <button
            type="button"
            onClick={exitDemoMode}
            className="underline underline-offset-2 font-medium hover:text-amber-950"
          >
            Exit demo
          </button>
        </>
      )}
    </div>
  )
}
