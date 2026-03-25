import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MarketFilters from './MarketFilters'

function ControlledSearchWrapper({
  onSearchChange,
}: {
  onSearchChange: (value: string) => void
}) {
  const [search, setSearch] = useState('')
  return (
    <MarketFilters
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
        selectedLine={null}
        onLineChange={onLineChange}
        search=""
        onSearchChange={() => {}}
      />,
    )
    const view = within(container)

    await user.click(view.getByRole('button', { name: 'All' }))
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
