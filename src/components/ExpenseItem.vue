<template>
  <view class="expense-item" @click="onClick">
    <view class="item-left">
      <view class="item-dot" :style="{ backgroundColor: categoryMeta?.color }"></view>
      <view class="item-info">
        <text class="item-category">{{ categoryMeta?.label ?? expense.category }}</text>
        <text class="item-date">{{ expense.date }}</text>
        <text v-if="expense.note" class="item-note">{{ expense.note }}</text>
      </view>
    </view>
    <view class="item-right">
      <text class="item-amount" :style="{ color: currencyMeta?.color }">
        {{ currencyMeta?.symbol }} {{ expense.amount.toFixed(2) }}
      </text>
      <view class="item-actions" v-if="showActions">
        <text class="action-btn edit" @click.stop="$emit('edit', expense.id)">编辑</text>
        <text class="action-btn delete" @click.stop="$emit('delete', expense.id)">删除</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Expense } from '@/types'
import { CATEGORY_META } from '@/types'
import { getCurrencyMeta } from '@/utils/currency'

const props = defineProps<{
  expense: Expense
  showActions?: boolean
}>()

defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

const categoryMeta = computed(() => CATEGORY_META[props.expense.category])
const currencyMeta = computed(() => getCurrencyMeta(props.expense.currency))

function onClick() {
  // 点击跳转编辑页面（预留）
}
</script>

<style lang="scss" scoped>
.expense-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  background-color: $color-card;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
}

.item-left {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex: 1;
  min-width: 0;
}

.item-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.item-category {
  font-size: $font-md;
  font-weight: 600;
  color: $color-text;
}

.item-date {
  font-size: $font-xs;
  color: $color-text-light;
  margin-top: 4rpx;
}

.item-note {
  font-size: $font-xs;
  color: $color-text-light;
  margin-top: 4rpx;
  max-width: 260rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  margin-left: $spacing-sm;
}

.item-amount {
  font-size: $font-lg;
  font-weight: 700;
}

.item-actions {
  display: flex;
  gap: $spacing-sm;
  margin-top: 8rpx;
}

.action-btn {
  font-size: 20rpx;
  padding: 4rpx 16rpx;
  border-radius: $radius-sm;
  line-height: 1.4;

  &.edit {
    color: $color-primary;
    border: 1px solid $color-primary;
  }

  &.delete {
    color: $color-text-light;
    border: 1px solid $color-text-light;
  }
}
</style>
