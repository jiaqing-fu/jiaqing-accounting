/**
 * 花销 API — H5 / Electron 端实现
 *
 * 经 HTTP 请求本地 Express 服务（Electron 主进程拉起，端口 3000）。
 * 本文件由 `expense.ts` 按平台调度。
 */
import type {
  CategoryStats,
  CreateExpenseInput,
  Expense,
  ExpenseFilter,
  ExpenseSummary,
} from '@/types'
import type { ExpenseApi } from './expense.types'

const BASE_URL = '/api'

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

export const h5ExpenseApi: ExpenseApi = {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchSummary,
  fetchCategoryStats,
}
