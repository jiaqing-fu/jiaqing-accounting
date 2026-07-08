import { describe, it, expect } from 'vitest'
import { Currency } from '@/types'
import { getCurrencySymbol, formatAmount, getCurrencyMeta, getAllCurrencies } from './currency'

describe('getCurrencySymbol', () => {
  it('returns ¥ for CNY', () => {
    expect(getCurrencySymbol(Currency.CNY)).toBe('¥')
  })

  it('returns HK$ for HKD', () => {
    expect(getCurrencySymbol(Currency.HKD)).toBe('HK$')
  })

  it('returns $ for USD', () => {
    expect(getCurrencySymbol(Currency.USD)).toBe('$')
  })
})

describe('formatAmount', () => {
  it('formats CNY amount', () => {
    expect(formatAmount(100, Currency.CNY)).toBe('¥ 100.00')
  })

  it('formats HKD amount with decimals', () => {
    expect(formatAmount(50.5, Currency.HKD)).toBe('HK$ 50.50')
  })

  it('formats USD amount with zero', () => {
    expect(formatAmount(0, Currency.USD)).toBe('$ 0.00')
  })

  it('rounds to 2 decimal places', () => {
    expect(formatAmount(10.999, Currency.CNY)).toBe('¥ 11.00')
  })

  it('formats large amounts', () => {
    expect(formatAmount(9999999.99, Currency.HKD)).toBe('HK$ 9999999.99')
  })
})

describe('getCurrencyMeta', () => {
  it('returns correct meta for CNY', () => {
    const meta = getCurrencyMeta(Currency.CNY)
    expect(meta.code).toBe(Currency.CNY)
    expect(meta.symbol).toBe('¥')
    expect(meta.label).toBe('人民币')
  })

  it('returns correct meta for HKD', () => {
    const meta = getCurrencyMeta(Currency.HKD)
    expect(meta.code).toBe(Currency.HKD)
    expect(meta.label).toBe('港币')
  })

  it('returns correct meta for USD', () => {
    const meta = getCurrencyMeta(Currency.USD)
    expect(meta.code).toBe(Currency.USD)
    expect(meta.label).toBe('美元')
  })
})

describe('getAllCurrencies', () => {
  it('returns all 3 currencies', () => {
    const all = getAllCurrencies()
    expect(all).toHaveLength(3)
  })

  it('includes CNY, HKD, USD', () => {
    const codes = getAllCurrencies().map(c => c.code)
    expect(codes).toContain(Currency.CNY)
    expect(codes).toContain(Currency.HKD)
    expect(codes).toContain(Currency.USD)
  })
})
