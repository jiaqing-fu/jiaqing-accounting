/** 币种 */
export type Currency = 'CNY' | 'HKD' | 'USD'

/** 花销类别 */
export type Category = '生活花销' | '交通通勤' | '兴趣爱好' | '其他'

/** 花销记录 */
export interface Expense {
  id: string
  amount: number
  currency: Currency
  category: Category
  date: string // YYYY-MM-DD
  note?: string | null
  created_at: string
  updated_at: string
}

/** 创建花销输入 */
export interface CreateExpenseInput {
  amount: number
  currency: Currency
  category: Category
  date: string
  note?: string | null
}

/** 更新花销输入 */
export interface UpdateExpenseInput {
  amount?: number
  currency?: Currency
  category?: Category
  date?: string
  note?: string | null
}

/** 花销筛选条件 */
export interface ExpenseFilter {
  month?: string
  currency?: Currency
  category?: Category
}

/** 汇总 */
export interface ExpenseSummary {
  currency: Currency
  total: number
  count: number
}

/** 类别统计 */
export interface CategoryStats {
  category: Category
  total: number
  percentage: number
  count: number
}
