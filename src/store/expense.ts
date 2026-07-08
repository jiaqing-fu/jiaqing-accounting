import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Expense, CreateExpenseInput, ExpenseFilter, ExpenseSummary, CategoryStats, Currency, Category } from '@/types'
import { Currency as CurrencyEnum } from '@/types'
import { getCurrentMonth } from '@/utils/helpers'
import * as expenseApi from '@/api/expense'

export const useExpenseStore = defineStore('expense', () => {
  // ========== 状态 ==========
  const expenses = ref<Expense[]>([])
  const summary = ref<ExpenseSummary[]>([])
  const categoryStats = ref<CategoryStats[]>([])
  const loading = ref(false)
  const currentMonth = ref(getCurrentMonth())
  const filterCurrency = ref<Currency | null>(null)
  const filterCategory = ref<Category | null>(null)

  // ========== 计算属性 ==========
  const activeFilter = computed<ExpenseFilter>(() => ({
    month: currentMonth.value,
    currency: filterCurrency.value ?? undefined,
    category: filterCategory.value ?? undefined,
  }))

  const filteredExpenses = computed(() => expenses.value)

  const totalByCurrency = computed(() => {
    const map = new Map<string, number>()
    for (const s of summary.value) {
      map.set(s.currency, s.total)
    }
    return map
  })

  const totalCNY = computed(() => totalByCurrency.value.get(CurrencyEnum.CNY) ?? 0)
  const totalHKD = computed(() => totalByCurrency.value.get(CurrencyEnum.HKD) ?? 0)
  const totalUSD = computed(() => totalByCurrency.value.get(CurrencyEnum.USD) ?? 0)

  // ========== 方法 ==========
  async function loadExpenses() {
    loading.value = true
    try {
      expenses.value = await expenseApi.fetchExpenses(activeFilter.value)
    } catch (e) {
      console.error('加载花销列表失败:', e)
      expenses.value = []
    } finally {
      loading.value = false
    }
  }

  async function loadSummary() {
    try {
      summary.value = await expenseApi.fetchSummary(currentMonth.value)
    } catch (e) {
      console.error('加载汇总失败:', e)
      summary.value = []
    }
  }

  async function loadCategoryStats() {
    try {
      categoryStats.value = await expenseApi.fetchCategoryStats(
        currentMonth.value,
        filterCurrency.value ?? undefined
      )
    } catch (e) {
      console.error('加载类别统计失败:', e)
      categoryStats.value = []
    }
  }

  async function loadAll() {
    await Promise.all([loadExpenses(), loadSummary(), loadCategoryStats()])
  }

  async function addExpense(input: CreateExpenseInput) {
    try {
      await expenseApi.createExpense(input)
      await loadAll()
      return true
    } catch (e) {
      console.error('添加花销失败:', e)
      return false
    }
  }

  async function editExpense(id: string, input: Partial<CreateExpenseInput>) {
    try {
      await expenseApi.updateExpense(id, input)
      await loadAll()
      return true
    } catch (e) {
      console.error('更新花销失败:', e)
      return false
    }
  }

  async function removeExpense(id: string) {
    try {
      await expenseApi.deleteExpense(id)
      await loadAll()
      return true
    } catch (e) {
      console.error('删除花销失败:', e)
      return false
    }
  }

  function setMonth(month: string) {
    currentMonth.value = month
    loadAll()
  }

  function setFilterCurrency(currency: Currency | null) {
    filterCurrency.value = currency
    loadExpenses()
    loadCategoryStats()
  }

  function setFilterCategory(category: Category | null) {
    filterCategory.value = category
    loadExpenses()
  }

  return {
    // 状态
    expenses,
    summary,
    categoryStats,
    loading,
    currentMonth,
    filterCurrency,
    filterCategory,
    // 计算属性
    activeFilter,
    filteredExpenses,
    totalByCurrency,
    totalCNY,
    totalHKD,
    totalUSD,
    // 方法
    loadExpenses,
    loadSummary,
    loadCategoryStats,
    loadAll,
    addExpense,
    editExpense,
    removeExpense,
    setMonth,
    setFilterCurrency,
    setFilterCategory,
  }
})
