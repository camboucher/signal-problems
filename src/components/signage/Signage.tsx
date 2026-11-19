import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Blinking status light, the little "train signal" bullet used on the
 *  landing page. Green by default; pass a tone for late / very late. */
export function LiveDot({
  tone = 'on',
  className = '',
}: {
  readonly tone?: 'on' | 'late' | 'very' | 'led'
  readonly className?: string
}) {
  const color = {
    on: 'bg-[#3ad07e]',
    late: 'bg-[#ffb020]',
    very: 'bg-[#ff5247]',
    led: 'bg-[#ffb800]',
  }[tone]
  return (
    <span
      aria-hidden
      className={`inline-block w-2 h-2 rounded-full shrink-0 animate-sp-blink ${color} ${className}`}
    />
  )
}

/** Small spaced-out caps label that sits above a section. */
export function SectionLabel({
  children,
  className = '',
}: {
  readonly children: ReactNode
  readonly className?: string
}) {
  return (
    <p
      className={`text-[10px] font-bold tracking-[0.2em] uppercase text-sp-dim mb-2.5 ${className}`}
    >
      {children}
    </p>
  )
}

/** Page title with an optional live dot and a right-hand slot. */
export function PageHeader({
  title,
  kicker,
  live = false,
  right,
}: {
  readonly title: ReactNode
  readonly kicker?: ReactNode
  readonly live?: boolean
  readonly right?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div className="min-w-0">
        {kicker && (
          <div className="flex items-center gap-2 mb-1.5">
            {live && <LiveDot />}
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-sp-dim">
              {kicker}
            </span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight leading-tight">{title}</h1>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}

/** The amber "S" roundel plus wordmark. */
export function SignLogo({ size = 'md' }: { readonly size?: 'md' | 'lg' }) {
  const dot = size === 'lg' ? 'w-7 h-7 text-[15px]' : 'w-6 h-6 text-xs'
  const word = size === 'lg' ? 'text-[15px]' : 'text-xs'
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0">
      <span
        className={`${dot} rounded-full bg-[#ffb800] text-[#0c0d12] inline-flex items-center justify-center font-bold`}
      >
        S
      </span>
      <span className={`${word} font-bold tracking-widest uppercase text-[#e9e9ed]`}>
        Signal Problems
      </span>
    </Link>
  )
}

/** Scrolling amber ticker. Items are rendered twice so the loop is seamless.
 *  Pauses on hover and stops entirely for reduced-motion users. */
export function Ticker({
  items,
  className = '',
  speed = 34,
}: {
  readonly items: ReactNode[]
  readonly className?: string
  /** Seconds per full loop. */
  readonly speed?: number
}) {
  if (items.length === 0) return null

  const run = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-5">{item}</span>
          <span className="text-[#ffb800]/40">·</span>
        </span>
      ))}
    </div>
  )

  return (
    <div
      className={`group overflow-hidden bg-[#0a0b0f] border-b border-[#ffb800]/20 text-[11px] font-bold tracking-widest uppercase text-[#ffb800] ${className}`}
    >
      <div
        className="flex w-max animate-sp-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${speed}s` }}
      >
        {run(false)}
        {run(true)}
      </div>
    </div>
  )
}
