import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUserLocation } from './use-user-location'

vi.mock('../lib/mock-mode', () => ({
  isMockMode: vi.fn(),
}))

import { isMockMode } from '../lib/mock-mode'

describe('useUserLocation', () => {
  beforeEach(() => {
    vi.mocked(isMockMode).mockReset()
    localStorage.clear()
  })

  it('returns a fixed Times Square location in mock mode', () => {
    vi.mocked(isMockMode).mockReturnValue(true)

    const { result } = renderHook(() => useUserLocation())

    act(() => {
      result.current.requestLocation()
    })

    expect(result.current.status).toBe('ready')
    expect(result.current.coordinates).toEqual({
      lat: 40.75529,
      lon: -73.987495,
    })
    expect(result.current.errorMessage).toBeNull()
  })

  it('restores coordinates and ready status from localStorage on mount', () => {
    vi.mocked(isMockMode).mockReturnValue(false)
    localStorage.setItem('user-location', JSON.stringify({ lat: 40.7, lon: -74.0 }))

    const { result } = renderHook(() => useUserLocation())

    expect(result.current.status).toBe('ready')
    expect(result.current.coordinates).toEqual({ lat: 40.7, lon: -74.0 })
  })

  it('starts idle when localStorage has no stored location', () => {
    vi.mocked(isMockMode).mockReturnValue(false)

    const { result } = renderHook(() => useUserLocation())

    expect(result.current.status).toBe('idle')
    expect(result.current.coordinates).toBeNull()
  })
})
