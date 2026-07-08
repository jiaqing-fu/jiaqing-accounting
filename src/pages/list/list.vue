<template>
  <view class="page-list">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <!-- 月份切换 -->
      <view class="month-nav">
        <text class="month-arrow" @click="prevMonth">◀</text>
        <text class="month-text">{{ currentMonth }}</text>
        <text class="month-arrow" @click="nextMonth">▶</text>
      </view>

      <!-- 币种筛选 -->
      <view class="filter-row">
        <text
          v-for="opt in currencyOptions"
          :key="opt.value"
          class="filter-tag"
          :class="{ active: filterCurrency === opt.value }"
          @click="onCurrencyFilter(opt.value)"
        >
          {{ opt.label }}
        </text>
      </view>
    </view>

    <!-- 当月汇总 -->
    <view class="list-summary" v-if="summary.length > 0">
      <text
        v-for="s in summary"
        :key="s.currency"
        class="summary-chip"
        :style="{ backgroundColor: getCurrencyColor(s.currency) }"
      >
        {{ getCurrencySymbol(s.currency) }} {{ s.total.toFixed(2) }}
      </text>
      <text class="summary-total-label">{{ summaryTotal }}</text>
    </view>

    <!-- 花销列表 -->
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="expenses.length === 0" class="empty">
      <text class="empty-icon">📒</text>
      <text class="empty-text">暂无花销记录</text>
    </view>
    <view v-else class="expense-list">
      <ExpenseItem
        v-for="expense in expenses"
        :key="expense.id"
        :expense="expense"
        :show-actions="true"
        @edit="onEdit"
        @delete="onDelete"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import type { Currency } from '@/types'
import { useExpenseStore } from '@/store/expense'
import { getAllCurrencies, getCurrencySymbol } from '@/utils/currency'
import { CURRENCY_META } from '@/types'
import ExpenseItem from '@/components/ExpenseItem.vue'

const store = useExpenseStore()

const expenses = computed(() => store.filteredExpenses)
const summary = computed(() => store.summary)
const loading = computed(() => store.loading)
const currentMonth = computed(() => store.currentMonth)
const filterCurrency = computed(() => store.filterCurrency)

const currencyOptions = computed(() => [
  { label: '全部', value: null },
  ...getAllCurrencies().map(c => ({ label: c.label, value: c.code as Currency | null })),
])

const summaryTotal = computed(() => {
  if (summary.value.length === 0) return ''
  const total = summary.value.reduce((acc, s) => acc + s.count, 0)
  return `共 ${total} 笔`
})

function getCurrencyColor(currency: string) {
  return CURRENCY_META[currency as keyof typeof CURRENCY_META]?.color ?? '#95a5a6'
}

onShow(() => {
  store.loadAll()
})

onPullDownRefresh(() => {
  store.loadAll().then(() => {
    uni.stopPullDownRefresh()
  })
})

function prevMonth() {
  changeMonth(-1)
}

function nextMonth() {
  changeMonth(1)
}

function changeMonth(offset: number) {
  const [y, m] = store.currentMonth.split('-').map(Number)
  const d = new Date(y, m - 1 + offset, 1)
  const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  store.setMonth(newMonth)
}

function onCurrencyFilter(value: Currency | null) {
  store.setFilterCurrency(value)
}

function onEdit(id: string) {
  // TODO: 弹出编辑框
  uni.showToast({ title: '编辑功能开发中', icon: 'none' })
}

async function onDelete(id: string) {
  const res = await new Promise<{ confirm: boolean }>((resolve) => {
    uni.showModal({
      title: '确认删除',
      content: '删除后不可恢复',
      success: (r) => resolve(r),
    })
  })
  if (res.confirm) {
    await store.removeExpense(id)
    uni.showToast({ title: '已删除', icon: 'success' })
  }
}
</script>

<style lang="scss" scoped>
.page-list {
  padding: $spacing-md;
  padding-bottom: 80rpx;
}

.filter-bar {
  background-color: $color-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-card;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-lg;
  margin-bottom: $spacing-md;
}

.month-arrow {
  font-size: $font-sm;
  color: $color-primary;
  padding: $spacing-xs $spacing-sm;
}

.month-text {
  font-size: $font-lg;
  font-weight: 700;
  color: $color-text;
}

.filter-row {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 8rpx 24rpx;
  border-radius: 40rpx;
  font-size: $font-xs;
  color: $color-text-light;
  background-color: $color-bg;
  border: 1px solid transparent;

  &.active {
    color: #fff;
    background-color: $color-primary;
  }
}

.list-summary {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  margin-bottom: $spacing-md;
  flex-wrap: wrap;
}

.summary-chip {
  padding: 4rpx 20rpx;
  border-radius: 24rpx;
  font-size: $font-xs;
  color: #fff;
  font-weight: 600;
}

.summary-total-label {
  font-size: $font-xs;
  color: $color-text-light;
  margin-left: auto;
}

.loading, .empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  color: $color-text-light;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: $spacing-md;
}

.empty-text {
  font-size: $font-md;
}
</style>
