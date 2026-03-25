import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DistributionBar from './DistributionBar'

describe('DistributionBar', () => {
  it('shows empty state when there are no wagers', () => {
    render(<DistributionBar onTimeAmount={0} lateAmount={0} />)
    expect(screen.getByText('No wagers yet')).toBeInTheDocument()
  })

  it('shows percentages and credit totals when wagers exist', () => {
    render(<DistributionBar onTimeAmount={60} lateAmount={40} />)
    expect(screen.getByText('ON TIME 60%')).toBeInTheDocument()
    expect(screen.getByText('LATE 40%')).toBeInTheDocument()
    expect(screen.getByText('60 credits')).toBeInTheDocument()
    expect(screen.getByText('40 credits')).toBeInTheDocument()
  })

  it('renders bar segments with proportional widths', () => {
    const { container } = render(
      <DistributionBar onTimeAmount={75} lateAmount={25} />,
    )
    const bars = container.querySelectorAll('[class*="bg-emerald-500"], [class*="bg-red-500"]')
    expect(bars.length).toBe(2)
    expect(bars[0]).toHaveStyle({ width: '75%' })
    expect(bars[1]).toHaveStyle({ width: '25%' })
  })
})
