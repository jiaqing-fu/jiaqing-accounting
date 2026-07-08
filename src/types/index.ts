/** 币种枚举 */
export enum Currency {
  CNY = 'CNY', // 人民币 ¥
  HKD = 'HKD', // 港币 HK$
  USD = 'USD', // 美元 $
}

/** 币种元数据 */
export interface CurrencyMeta {
  code: Currency
  symbol: string
  label: string
  color: string
}

/** 币种元数据映射 */
export const CURRENCY_META: Record<Currency, CurrencyMeta> = {
  [Currency.CNY]: { code: Currency.CNY, symbol: '¥', label: '人民币', color: '#e94560' },
  [Currency.HKD]: { code: Currency.HKD, symbol: 'HK$', label: '港币', color: '#2ecc71' },
  [Currency.USD]: { code: Currency.USD, symbol: '$', label: '美元', color: '#3498db' },
}

/** 花销类别枚举 */
export enum Category {
  LIVING = '生活花销',
  TRANSPORT = '交通通勤',
  HOBBY = '兴趣爱好',
  OTHER = '其他',
}

/** 类别元数据 */
export interface CategoryMeta {
  code: Category
  label: string
  icon: string
  color: string
}

/** 类别元数据映射 */
export const CATEGORY_META: Record<Category, CategoryMeta> = {
  [Category.LIVING]: { code: Category.LIVING, label: '生活花销', icon: 'living', color: '#e94560' },
  [Category.TRANSPORT]: { code: Category.TRANSPORT, label: '交通通勤', icon: 'transport', color: '#f39c12' },
  [Category.HOBBY]: { code: Category.HOBBY, label: '兴趣爱好', icon: 'hobby', color: '#9b59b6' },
  [Category.OTHER]: { code: Category.OTHER, label: '其他', icon: 'other', color: '#95a5a6' },
}

/** 花销记录 */
export interface Expense {
  id: string
  amount: number
  currency: Currency
  category: Category
  date: string // YYYY-MM-DD
  note?: string
  createdAt: string // ISO datetime
  updatedAt: string // ISO datetime
}

/** 创建花销的输入 */
export interface CreateExpenseInput {
  amount: number
  currency: Currency
  category: Category
  date: string
  note?: string
}

/** 更新花销的输入 */
export interface UpdateExpenseInput {
  id: string
  amount?: number
  currency?: Currency
  category?: Category
  date?: string
  note?: string
}

/** 花销筛选条件 */
export interface ExpenseFilter {
  month?: string // YYYY-MM
  currency?: Currency
  category?: Category
}

/** 统计汇总 */
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
