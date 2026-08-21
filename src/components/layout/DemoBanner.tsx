import { isMockMode, isRuntimeDemoMode, exitDemoMode } from '../../lib/mock-mode'

export default function DemoBanner() {
  if (!isMockMode()) return null

  return (
    <div className="bg-sp-led/10 border-b border-sp-led/30 text-sp-led text-xs sm:text-sm px-4 py-2 text-center">
      You're viewing a live demo with sample data — wagers and edits aren't saved.
      {isRuntimeDemoMode() && (
        <>
          {' '}
          <button
            type="button"
            onClick={exitDemoMode}
            className="underline underline-offset-2 font-bold hover:opacity-80"
          >
            Exit demo
          </button>
        </>
      )}
    </div>
  )
}
