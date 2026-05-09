import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DistributionBar from './DistributionBar'

describe('DistributionBar', () => {
  it('shows empty state when there are no wagers', () => {
    render(<DistributionBar onTimeAmount={0} lateAmount={0} veryLateAmount={0} />)
    expect(screen.getByText('No wagers yet')).toBeInTheDocument()
  })

  it('shows percentages and credit totals when wagers exist', () => {
    render(<DistributionBar onTimeAmount={60} lateAmount={30} veryLateAmount={10} />)
    expect(screen.getByText('ON TIME 60%')).toBeInTheDocument()
    expect(screen.getByText('LATE 30%')).toBeInTheDocument()
    expect(screen.getByText('VERY LATE 10%')).toBeInTheDocument()
    expect(screen.getByText('60 credits')).toBeInTheDocument()
    expect(screen.getByText('40 credits')).toBeInTheDocument()
  })

  it('renders bar segments with proportional widths', () => {
    const { container } = render(
      <DistributionBar onTimeAmount={75} lateAmount={15} veryLateAmount={10} />,
    )
    const onTimeBar = container.querySelector('[class*="bg-emerald-500"]')
    const lateBar = container.querySelector('[class*="bg-amber-500"]')
    const veryLateBar = container.querySelector('[class*="bg-red-500"]')
    expect(onTimeBar).toHaveStyle({ width: '75%' })
    expect(lateBar).toHaveStyle({ width: '15%' })
    expect(veryLateBar).toHaveStyle({ width: '10%' })
  })
})
