import type { Currency, CurrencyMeta } from '@/types'
import { CURRENCY_META } from '@/types'

/** 根据币种代码获取符号 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_META[currency]?.symbol ?? ''
}

/** 格式化金额显示 */
export function formatAmount(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency)
  return `${symbol} ${amount.toFixed(2)}`
}

/** 获取币种元数据 */
export function getCurrencyMeta(currency: Currency): CurrencyMeta {
  return CURRENCY_META[currency]
}

/** 获取所有币种 */
export function getAllCurrencies(): CurrencyMeta[] {
  return Object.values(CURRENCY_META)
}
