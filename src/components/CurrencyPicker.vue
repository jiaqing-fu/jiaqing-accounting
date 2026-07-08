<template>
  <view class="currency-picker">
    <view
      v-for="c in currencies"
      :key="c.code"
      class="currency-item"
      :class="{ active: modelValue === c.code }"
      :style="modelValue === c.code ? { backgroundColor: c.color, borderColor: c.color } : {}"
      @click="select(c.code)"
    >
      <text class="currency-symbol">{{ c.symbol }}</text>
      <text class="currency-label">{{ c.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Currency } from '@/types'
import { getAllCurrencies } from '@/utils/currency'

const props = defineProps<{
  modelValue: Currency
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Currency]
}>()

const currencies = getAllCurrencies()

function select(code: Currency) {
  emit('update:modelValue', code)
}
</script>

<style lang="scss" scoped>
.currency-picker {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.currency-item {
  flex: 1;
  min-width: 180rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx 16rpx;
  border: 3rpx solid $color-border;
  border-radius: $radius-md;
  background-color: $color-card;
  transition: all 0.2s ease;

  &.active {
    border-color: transparent;
    .currency-symbol { color: #fff; }
    .currency-label { color: rgba(255, 255, 255, 0.85); }
  }
}

.currency-symbol {
  font-size: 36rpx;
  font-weight: 700;
  color: $color-text;
  margin-bottom: 4rpx;
}

.currency-label {
  font-size: 22rpx;
  color: $color-text-light;
}
</style>
