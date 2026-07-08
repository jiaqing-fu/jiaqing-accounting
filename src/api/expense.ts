import type { CreateExpenseInput, Expense, ExpenseFilter, ExpenseSummary, CategoryStats } from '@/types'

// #ifdef H5
const BASE_URL = '/api'
// #endif

// #ifdef MP-WEIXIN
const BASE_URL = '' // 云函数直接调用
// #endif

/**
 * H5 端：通过 HTTP 请求本地 Express 服务
 * 小程序端：通过 uniCloud 调用云函数（V1 暂以本地存储模拟）
 */

// #ifdef H5
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

export async function fetchExpenses(filter?: ExpenseFilter): Promise<Expense[]> {
  const params = new URLSearchParams()
  if (filter?.month) params.set('month', filter.month)
  if (filter?.currency) params.set('currency', filter.currency)
  if (filter?.category) params.set('category', filter.category)
  const qs = params.toString()
  return request<Expense[]>('GET', `/expenses${qs ? '?' + qs : ''}`)
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  return request<Expense>('POST', '/expenses', input)
}

export async function updateExpense(id: string, input: Partial<CreateExpenseInput>): Promise<Expense> {
  return request<Expense>('PUT', `/expenses/${id}`, input)
}

export async function deleteExpense(id: string): Promise<void> {
  return request<void>('DELETE', `/expenses/${id}`)
}

export async function fetchSummary(month?: string): Promise<ExpenseSummary[]> {
  const params = month ? `?month=${month}` : ''
  return request<ExpenseSummary[]>('GET', `/expenses/summary${params}`)
}

export async function fetchCategoryStats(month?: string, currency?: string): Promise<CategoryStats[]> {
  const params = new URLSearchParams()
  if (month) params.set('month', month)
  if (currency) params.set('currency', currency)
  const qs = params.toString()
  return request<CategoryStats[]>('GET', `/expenses/stats${qs ? '?' + qs : ''}`)
}
// #endif

// #ifdef MP-WEIXIN
import storage from '@/utils/storage'

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
// #endif
