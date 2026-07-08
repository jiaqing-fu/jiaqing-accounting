<template>
  <view class="amount-input">
    <text class="amount-symbol">{{ symbol }}</text>
    <input
      class="amount-field"
      type="digit"
      :value="displayValue"
      placeholder="0.00"
      placeholder-style="color: #bfbfbf; font-size: 52rpx; font-weight: 500;"
      :maxlength="12"
      :adjust-position="true"
      @input="onInput"
      @blur="onBlur"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Currency } from '@/types'
import { getCurrencySymbol } from '@/utils/currency'

const props = defineProps<{
  modelValue: number
  currency: Currency
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const symbol = computed(() => getCurrencySymbol(props.currency))
const localValue = ref(props.modelValue > 0 ? String(props.modelValue) : '')

const displayValue = computed(() => localValue.value)

watch(() => props.modelValue, (val) => {
  if (val === 0) {
    localValue.value = ''
  } else if (String(val) !== localValue.value) {
    localValue.value = String(val)
  }
})

function onInput(e: { detail: { value: string } }) {
  let val = e.detail.value
  // 只允许数字和小数点
  val = val.replace(/[^\d.]/g, '')
  // 只保留第一个小数点
  const firstDot = val.indexOf('.')
  if (firstDot !== -1) {
    val = val.substring(0, firstDot + 1) + val.substring(firstDot + 1).replace(/\./g, '')
  }
  // 小数最多两位
  if (val.includes('.')) {
    const parts = val.split('.')
    if (parts[1] && parts[1].length > 2) {
      val = parts[0] + '.' + parts[1].substring(0, 2)
    }
  }
  localValue.value = val
  const num = parseFloat(val)
  emit('update:modelValue', isNaN(num) ? 0 : num)
}

function onBlur() {
  const num = parseFloat(localValue.value)
  if (!isNaN(num) && num > 0) {
    localValue.value = num.toFixed(2)
    emit('update:modelValue', Math.round(num * 100) / 100)
  }
}
</script>

<style lang="scss" scoped>
.amount-input {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36rpx 0 16rpx;
}

.amount-symbol {
  font-size: 56rpx;
  font-weight: 700;
  color: $color-primary;
  margin-right: 12rpx;
  line-height: 1.2;
}

.amount-field {
  font-size: 64rpx;
  font-weight: 700;
  color: $color-text;
  text-align: center;
  min-width: 160rpx;
  max-width: 480rpx;
  height: auto;
  line-height: 1.2;
  border-bottom: 4rpx solid $color-border;
  padding: 8rpx 16rpx;

  &:focus {
    border-bottom-color: $color-primary;
  }
}
</style>
