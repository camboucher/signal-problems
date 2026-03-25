import { describe, expect, it } from 'vitest'
import {
  FILTER_LINES,
  formatTime,
  getDelayMinutes,
  getLineColor,
  getLineTextColor,
} from './mta'

describe('getLineColor', () => {
  it('returns MTA hex for known lines', () => {
    expect(getLineColor('1')).toBe('#EE352E')
    expect(getLineColor('A')).toBe('#0039A6')
    expect(getLineColor('N')).toBe('#FCCC0A')
    expect(getLineColor('SI')).toBe('#0039A6')
  })

  it('strips express suffix before lookup', () => {
    expect(getLineColor('6X')).toBe('#00933C')
  })

  it('falls back to gray for unknown routes', () => {
    expect(getLineColor('ZZ')).toBe('#808183')
  })
})

describe('getLineTextColor', () => {
  it('uses dark text on yellow N/Q/R/W lines', () => {
    expect(getLineTextColor('N')).toBe('#000')
    expect(getLineTextColor('Q')).toBe('#000')
    expect(getLineTextColor('R')).toBe('#000')
    expect(getLineTextColor('W')).toBe('#000')
  })

  it('uses white text on other lines', () => {
    expect(getLineTextColor('1')).toBe('#fff')
    expect(getLineTextColor('A')).toBe('#fff')
  })
})

describe('formatTime', () => {
  it('formats ISO timestamps in en-US 12h style (TZ=UTC)', () => {
    expect(formatTime('2025-06-15T14:30:00.000Z')).toBe('2:30 PM')
    expect(formatTime('2025-06-15T09:05:00.000Z')).toBe('9:05 AM')
  })
})

describe('getDelayMinutes', () => {
  it('returns rounded minute difference (predicted - scheduled)', () => {
    expect(
      getDelayMinutes(
        '2025-06-15T14:00:00.000Z',
        '2025-06-15T14:07:00.000Z',
      ),
    ).toBe(7)
    expect(
      getDelayMinutes(
        '2025-06-15T14:00:00.000Z',
        '2025-06-15T13:58:00.000Z',
      ),
    ).toBe(-2)
  })
})

describe('FILTER_LINES', () => {
  it('lists every subway line filter chip', () => {
    expect(FILTER_LINES).toHaveLength(23)
    expect(FILTER_LINES).toContain('7')
    expect(FILTER_LINES).toContain('S')
  })
})
