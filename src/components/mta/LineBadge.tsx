import { getLineColor, getLineTextColor } from '../../lib/mta'

const SIZES = {
  sm: 'w-5 h-5 text-[10px]',
  md: 'w-7 h-7 text-xs',
  lg: 'w-9 h-9 text-sm',
} as const

interface Props {
  line: string
  size?: keyof typeof SIZES
}

export default function LineBadge({ line, size = 'md' }: Props) {
  return (
    <span
      className={`${SIZES[size]} inline-flex items-center justify-center rounded-full font-bold shrink-0 leading-none`}
      style={{ backgroundColor: getLineColor(line), color: getLineTextColor(line) }}
    >
      {line.replace(/X$/, '')}
    </span>
  )
}
