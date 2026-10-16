/**
 * 花销 API — 微信小程序端实现
 *
 * 当前直接读写本地缓存（uni.storage），两端数据各自独立。
 * 原计划的微信云开发未实现，若将来接入，替换本文件即可，调用方无需改动。
 * 本文件由 `expense.ts` 按平台调度。
 */
import type {
  CategoryStats,
  CreateExpenseInput,
  Expense,
  ExpenseFilter,
  ExpenseSummary,
} from '@/types'
import storage from '@/utils/storage'
import type { ExpenseApi } from './expense.types'

const STORAGE_KEY = 'expenses'

function loadAll(): Expense[] {
  return storage.get<Expense[]>(STORAGE_KEY) ?? []
}

function saveAll(expenses: Expense[]): void {
  storage.set(STORAGE_KEY, expenses)
}

export async function fetchExpenses(filter?: ExpenseFilter): Promise<Expense[]> {
  let list = loadAll()
  if (filter?.month) {
    list = list.filter(e => e.date.startsWith(filter.month!))
  }
  if (filter?.currency) {
    list = list.filter(e => e.currency === filter.currency)
  }
  if (filter?.category) {
    list = list.filter(e => e.category === filter.category)
  }
  return list.sort((a, b) => b.date.localeCompare(a.date))
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const { generateId } = await import('@/utils/helpers')
  const now = new Date().toISOString()
  const expense: Expense = {
    id: generateId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  }
  const list = loadAll()
  list.push(expense)
  saveAll(list)
  return expense
}

export async function updateExpense(id: string, input: Partial<CreateExpenseInput>): Promise<Expense> {
  const list = loadAll()
  const idx = list.findIndex(e => e.id === id)
  if (idx === -1) throw new Error('记录不存在')
  list[idx] = { ...list[idx], ...input, updatedAt: new Date().toISOString() }
  saveAll(list)
  return list[idx]
}

export async function deleteExpense(id: string): Promise<void> {
  const list = loadAll().filter(e => e.id !== id)
  saveAll(list)
}

export async function fetchSummary(month?: string): Promise<ExpenseSummary[]> {
  let list = loadAll()
  if (month) list = list.filter(e => e.date.startsWith(month))
  const map = new Map<string, { total: number; count: number }>()
  for (const e of list) {
    const cur = map.get(e.currency) ?? { total: 0, count: 0 }
    cur.total += e.amount
    cur.count += 1
    map.set(e.currency, cur)
  }
  const result: ExpenseSummary[] = []
  map.forEach((v, currency) => {
    result.push({ currency: currency as ExpenseSummary['currency'], total: Math.round(v.total * 100) / 100, count: v.count })
  })
  return result
}

export async function fetchCategoryStats(month?: string, currency?: string): Promise<CategoryStats[]> {
  let list = loadAll()
  if (month) list = list.filter(e => e.date.startsWith(month))
  if (currency) list = list.filter(e => e.currency === currency)
  const map = new Map<string, { total: number; count: number }>()
  let grandTotal = 0
  for (const e of list) {
    const cur = map.get(e.category) ?? { total: 0, count: 0 }
    cur.total += e.amount
    cur.count += 1
    grandTotal += e.amount
    map.set(e.category, cur)
  }
  const result: CategoryStats[] = []
  map.forEach((v, category) => {
    result.push({
      category: category as CategoryStats['category'],
      total: Math.round(v.total * 100) / 100,
      percentage: grandTotal > 0 ? Math.round((v.total / grandTotal) * 10000) / 100 : 0,
      count: v.count,
    })
  })
  return result.sort((a, b) => b.total - a.total)
}

export const mpExpenseApi: ExpenseApi = {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchSummary,
  fetchCategoryStats,
}
