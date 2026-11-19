import type { ReactNode } from 'react'
import { LiveDot, SignLogo } from '../signage/Signage'

/** Frame for the sign-in / sign-up / username screens: the dark sign bar on
 *  top and a centered card underneath. */
export default function AuthShell({
  kicker,
  title,
  subtitle,
  children,
}: {
  readonly kicker?: string
  readonly title: ReactNode
  readonly subtitle?: ReactNode
  readonly children: ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#0c0d12] border-b-[3px] border-[#ffb800]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <SignLogo />
        </div>
      </header>
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-7">
            {kicker && (
              <div className="flex items-center gap-2 mb-2">
                <LiveDot />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-sp-dim">
                  {kicker}
                </span>
              </div>
            )}
            <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-sp-dim mt-2 leading-relaxed">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
