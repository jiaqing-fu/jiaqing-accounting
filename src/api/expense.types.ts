/**
 * 花销 API 契约
 *
 * 两个平台的实现（`expense.h5.ts` / `expense.mp.ts`）都必须满足此接口。
 * 一旦某一端漏了方法或改了签名，`npm run typecheck` 会立刻报错——
 * 这是拆出本文件的主要目的。
 */
import type {
  CategoryStats,
  CreateExpenseInput,
  Expense,
  ExpenseFilter,
  ExpenseSummary,
} from '@/types'

export interface ExpenseApi {
  fetchExpenses(filter?: ExpenseFilter): Promise<Expense[]>
  createExpense(input: CreateExpenseInput): Promise<Expense>
  updateExpense(id: string, input: Partial<CreateExpenseInput>): Promise<Expense>
  deleteExpense(id: string): Promise<void>
  fetchSummary(month?: string): Promise<ExpenseSummary[]>
  fetchCategoryStats(month?: string, currency?: string): Promise<CategoryStats[]>
}
