/**
 * 花销 API — 平台调度入口
 *
 * 调用方一律 `import { fetchExpenses } from '@/api/expense'`，无需感知平台。
 *
 * 这里刻意**不用** `// #ifdef` 条件编译。原因是条件编译对 tsc 只是注释，
 * 两个平台分支同时可见会被判定为「重复声明」（H5 与小程序的实现各有一套同名导出），
 * 导致整个文件游离在类型检查之外。改用 `process.env.UNI_PLATFORM`：
 * uni-app 在构建时把它内联为字符串字面量（实测产物中 `process.env` 出现次数为 0），
 * 未命中的分支会被摇掉，效果与条件编译等价，但 tsc 能完整读懂。
 */
import { h5ExpenseApi } from './expense.h5'
import { mpExpenseApi } from './expense.mp'
import type { ExpenseApi } from './expense.types'

const impl: ExpenseApi =
  process.env.UNI_PLATFORM === 'h5' ? h5ExpenseApi : mpExpenseApi

export const fetchExpenses = impl.fetchExpenses
export const createExpense = impl.createExpense
export const updateExpense = impl.updateExpense
export const deleteExpense = impl.deleteExpense
export const fetchSummary = impl.fetchSummary
export const fetchCategoryStats = impl.fetchCategoryStats

export type { ExpenseApi }
