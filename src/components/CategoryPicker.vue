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
  gap: $spacing-sm;
}

.category-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border: 2px solid $color-border;
  border-radius: $radius-md;
  background-color: $color-card;
  transition: all 0.2s ease;
  cursor: pointer;

  &.active {
    border-color: transparent;
    .category-label { color: #fff; }
  }
}

.category-dot {
  width: 12px;
  height: 12px;
  border-radius: $radius-round;
  flex-shrink: 0;
}

.category-label {
  font-size: $font-sm;
  color: $color-text;
}
</style>
