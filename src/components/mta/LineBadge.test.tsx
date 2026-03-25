import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import LineBadge from './LineBadge'

describe('LineBadge', () => {
  it('renders the line letter and applies colors from mta helpers', () => {
    const { container } = render(<LineBadge line="A" />)
    expect(screen.getByText('A')).toBeInTheDocument()
    const span = container.querySelector('span')
    expect(span).toHaveStyle({ backgroundColor: '#0039A6', color: '#fff' })
  })

  it('strips express X suffix for display', () => {
    render(<LineBadge line="6X" />)
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('supports size variants via class names', () => {
    const { container: sm } = render(<LineBadge line="1" size="sm" />)
    expect(sm.querySelector('span')).toHaveClass('w-5', 'h-5')

    const { container: lg } = render(<LineBadge line="1" size="lg" />)
    expect(lg.querySelector('span')).toHaveClass('w-9', 'h-9')
  })
})
