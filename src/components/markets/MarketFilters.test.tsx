import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MarketFilters from './MarketFilters'

const DEFAULT_PROPS = {
  viewMode: 'open' as const,
  onViewModeChange: () => {},
  sortBy: 'time' as const,
  onSortByChange: () => {},
  isAuthenticated: false,
  locationStatus: 'idle' as const,
  onRequestLocation: () => {},
}

function ControlledSearchWrapper({
  onSearchChange,
}: {
  onSearchChange: (value: string) => void
}) {
  const [search, setSearch] = useState('')
  return (
    <MarketFilters
      {...DEFAULT_PROPS}
      selectedLine={null}
      onLineChange={() => {}}
      search={search}
      onSearchChange={(v) => {
        setSearch(v)
        onSearchChange(v)
      }}
    />
  )
}

describe('MarketFilters', () => {
  it('calls onLineChange when a line badge is toggled', async () => {
    const user = userEvent.setup()
    const onLineChange = vi.fn()
    const { container } = render(
      <MarketFilters
        {...DEFAULT_PROPS}
        selectedLine={null}
        onLineChange={onLineChange}
        search=""
        onSearchChange={() => {}}
      />,
    )
    const view = within(container)

    // The line-badge "All" button is the one inside the scrollable row
    const allButtons = view.getAllByRole('button', { name: 'All' })
    // First is the view mode tab, second is the line-badges "All"
    await user.click(allButtons[1]!)
    expect(onLineChange).toHaveBeenLastCalledWith(null)

    const lineAButtons = view.getAllByRole('button').filter((b) =>
      b.textContent === 'A',
    )
    await user.click(lineAButtons[0]!)
    expect(onLineChange).toHaveBeenLastCalledWith('A')
  })

  it('calls onSearchChange when typing in the search field', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    const { container } = render(
      <ControlledSearchWrapper onSearchChange={onSearchChange} />,
    )

    await user.type(
      within(container).getByPlaceholderText(/search stations/i),
      'Penn',
    )
    expect(onSearchChange).toHaveBeenCalled()
    const lastCall =
      onSearchChange.mock.calls[onSearchChange.mock.calls.length - 1]
    expect(lastCall?.[0]).toContain('Penn')
  })
})
