<template>
  <view class="category-picker">
    <view
      v-for="cat in categories"
      :key="cat.code"
      class="category-item"
      :class="{ active: modelValue === cat.code }"
      :style="modelValue === cat.code ? { backgroundColor: cat.color, borderColor: cat.color } : {}"
      @click="select(cat.code)"
    >
      <view class="category-dot" :style="{ backgroundColor: modelValue === cat.code ? '#fff' : cat.color }"></view>
      <text class="category-label">{{ cat.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Category } from '@/types'
import { CATEGORY_META } from '@/types'

const props = defineProps<{
  modelValue: Category
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Category]
}>()

const categories = Object.values(CATEGORY_META)

function select(code: Category) {
  emit('update:modelValue', code)
}
</script>

<style lang="scss" scoped>
.category-picker {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  border: 3rpx solid $color-border;
  border-radius: $radius-md;
  background-color: $color-card;
  transition: all 0.2s ease;

  &.active {
    border-color: transparent;
    .category-label { color: #fff; }
  }
}

.category-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-label {
  font-size: 28rpx;
  color: $color-text;
}
</style>
