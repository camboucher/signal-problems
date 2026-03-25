const LINE_COLORS: Record<string, string> = {
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  '4': '#00933C', '5': '#00933C', '6': '#00933C',
  '7': '#B933AD',
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
  'G': '#6CBE45',
  'J': '#996633', 'Z': '#996633',
  'L': '#A7A9AC',
  'S': '#808183',
  'SI': '#0039A6',
}

const DARK_TEXT_LINES = new Set(['N', 'Q', 'R', 'W'])

export function getLineColor(routeId: string): string {
  return LINE_COLORS[routeId.replace(/X$/, '')] ?? '#808183'
}

export function getLineTextColor(routeId: string): string {
  return DARK_TEXT_LINES.has(routeId.replace(/X$/, '')) ? '#000' : '#fff'
}

export const FILTER_LINES = [
  '1', '2', '3', '4', '5', '6', '7',
  'A', 'C', 'E', 'B', 'D', 'F', 'M',
  'N', 'Q', 'R', 'W', 'G', 'J', 'Z', 'L', 'S',
] as const

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getDelayMinutes(scheduled: string, predicted: string): number {
  return Math.round(
    (new Date(predicted).getTime() - new Date(scheduled).getTime()) / 60_000,
  )
}
