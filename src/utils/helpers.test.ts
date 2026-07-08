import { describe, it, expect } from 'vitest'
import { generateId, getTodayStr, getCurrentMonth, formatISODate, truncate } from './helpers'

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId()
    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
  })

  it('generates unique IDs on consecutive calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })

  it('contains a hyphen separator', () => {
    expect(generateId()).toMatch(/^[a-z0-9]+-[a-z0-9]+$/)
  })
})

describe('getTodayStr', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(getTodayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns valid date components', () => {
    const [y, m, d] = getTodayStr().split('-').map(Number)
    expect(y).toBeGreaterThanOrEqual(2024)
    expect(m).toBeGreaterThanOrEqual(1)
    expect(m).toBeLessThanOrEqual(12)
    expect(d).toBeGreaterThanOrEqual(1)
    expect(d).toBeLessThanOrEqual(31)
  })
})

describe('getCurrentMonth', () => {
  it('returns YYYY-MM format', () => {
    expect(getCurrentMonth()).toMatch(/^\d{4}-\d{2}$/)
  })

  it('month is between 01 and 12', () => {
    const month = parseInt(getCurrentMonth().split('-')[1], 10)
    expect(month).toBeGreaterThanOrEqual(1)
    expect(month).toBeLessThanOrEqual(12)
  })
})

describe('formatISODate', () => {
  it('extracts date portion from ISO string', () => {
    expect(formatISODate('2026-07-08T14:30:00.000Z')).toBe('2026-07-08')
  })

  it('works with timezone offsets', () => {
    expect(formatISODate('2026-01-01T00:00:00+08:00')).toBe('2026-01-01')
  })
})

describe('truncate', () => {
  it('returns original text when shorter than maxLen', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('returns original text when equal to maxLen', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates and appends ... when too long', () => {
    expect(truncate('hello world', 8)).toBe('hello wo...')
  })

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })
})
