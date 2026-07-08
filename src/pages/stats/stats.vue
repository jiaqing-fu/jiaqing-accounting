<template>
  <view class="page-stats">
    <!-- 月份 & 币种选择 -->
    <view class="stats-filter">
      <view class="month-nav">
        <text class="month-arrow" @click="prevMonth">◀</text>
        <text class="month-text">{{ currentMonth }}</text>
        <text class="month-arrow" @click="nextMonth">▶</text>
      </view>
      <view class="filter-row">
        <text
          v-for="opt in currencyOptions"
          :key="opt.value ?? 'all'"
          class="filter-tag"
          :class="{ active: filterCurrency === opt.value }"
          @click="onCurrencyFilter(opt.value)"
        >
          {{ opt.label }}
        </text>
      </view>
    </view>

    <!-- 汇总卡片 -->
    <view class="summary-cards" v-if="summary.length > 0">
      <view
        v-for="s in summary"
        :key="s.currency"
        class="summary-card"
      >
        <text class="card-symbol">{{ getCurrencySymbol(s.currency) }}</text>
        <text class="card-amount">{{ s.total.toFixed(2) }}</text>
        <text class="card-count">{{ s.count }} 笔</text>
      </view>
    </view>

    <!-- 类别占比 -->
    <view class="section" v-if="categoryStats.length > 0">
      <text class="section-title">类别占比</text>
      <view class="category-bars">
        <view
          v-for="s in categoryStats"
          :key="s.category"
          class="bar-item"
        >
          <view class="bar-label">
            <text class="bar-name">{{ s.category }}</text>
            <text class="bar-percent">{{ s.percentage.toFixed(1) }}%</text>
          </view>
          <view class="bar-track">
            <view
              class="bar-fill"
              :style="{ width: s.percentage + '%', backgroundColor: getCategoryColor(s.category) }"
            ></view>
          </view>
          <text class="bar-amount">{{ getCurrencySymbol(activeCurrency) }} {{ s.total.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="summary.length === 0 && !loading" class="empty">
      <text class="empty-icon">📊</text>
      <text class="empty-text">暂无统计数据</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { Currency } from '@/types'
import { CATEGORY_META } from '@/types'
import { useExpenseStore } from '@/store/expense'
import { getAllCurrencies, getCurrencySymbol } from '@/utils/currency'

const store = useExpenseStore()

const summary = computed(() => store.summary)
const categoryStats = computed(() => store.categoryStats)
const loading = computed(() => store.loading)
const currentMonth = computed(() => store.currentMonth)
const filterCurrency = computed(() => store.filterCurrency)

const activeCurrency = computed(() => filterCurrency.value ?? 'CNY')

const currencyOptions = computed(() => [
  { label: '全部币种', value: null },
  ...getAllCurrencies().map(c => ({ label: c.label, value: c.code as Currency | null })),
])

function getCategoryColor(category: string) {
  return CATEGORY_META[category as keyof typeof CATEGORY_META]?.color ?? '#95a5a6'
}

function getCurrencySymbol(code: string) {
  return getCurrencySymbol(code as Currency)
}

onShow(() => {
  store.loadSummary()
  store.loadCategoryStats()
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
</script>

<style lang="scss" scoped>
.page-stats {
  padding: $spacing-md;
  padding-bottom: 80rpx;
}

.stats-filter {
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

.summary-cards {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.summary-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md;
  background-color: $color-card;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
}

.card-symbol {
  font-size: $font-xs;
  color: $color-text-light;
}

.card-amount {
  font-size: $font-lg;
  font-weight: 700;
  color: $color-text;
  margin: 8rpx 0;
}

.card-count {
  font-size: $font-xs;
  color: $color-text-light;
}

.section {
  background-color: $color-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-card;
}

.section-title {
  font-size: $font-md;
  font-weight: 700;
  color: $color-text;
  margin-bottom: $spacing-md;
}

.category-bars {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.bar-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.bar-label {
  display: flex;
  justify-content: space-between;
}

.bar-name {
  font-size: $font-sm;
  color: $color-text;
}

.bar-percent {
  font-size: $font-sm;
  font-weight: 600;
  color: $color-text-light;
}

.bar-track {
  width: 100%;
  height: 16rpx;
  background-color: $color-bg;
  border-radius: 8rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.4s ease;
}

.bar-amount {
  font-size: $font-xs;
  color: $color-text-light;
  text-align: right;
}

.empty {
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
