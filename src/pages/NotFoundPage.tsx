import { Link } from 'react-router-dom'
import { LiveDot, SignLogo } from '../components/signage/Signage'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#0c0d12] border-b-[3px] border-[#ffb800]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <SignLogo />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <LiveDot tone="very" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-sp-dim">
              Not in service
            </span>
          </div>
          <p className="text-6xl font-medium tracking-tight tabular-nums text-sp-led mb-3">404</p>
          <p className="text-sp-dim mb-8">This stop doesn't exist. Let's get you back on track.</p>
          <Link to="/" className="btn-primary px-6 py-3">
            Back to the trains
          </Link>
        </div>
      </main>
    </div>
  )
}
