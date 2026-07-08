<template>
  <view class="page-index">
    <!-- 本月汇总 -->
    <view class="summary-bar">
      <view class="summary-item" :style="{ color: '#e94560' }">
        <text class="summary-symbol">¥</text>
        <text class="summary-amount">{{ totalCNY.toFixed(2) }}</text>
      </view>
      <view class="summary-item" :style="{ color: '#2ecc71' }">
        <text class="summary-symbol">HK$</text>
        <text class="summary-amount">{{ totalHKD.toFixed(2) }}</text>
      </view>
      <view class="summary-item" :style="{ color: '#3498db' }">
        <text class="summary-symbol">$</text>
        <text class="summary-amount">{{ totalUSD.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 记账表单 -->
    <view class="form-card">
      <!-- 金额输入 -->
      <AmountInput v-model="amount" :currency="currency" />

      <!-- 币种选择 -->
      <view class="form-section">
        <text class="form-label">币种</text>
        <CurrencyPicker v-model="currency" />
      </view>

      <!-- 类别选择 -->
      <view class="form-section">
        <text class="form-label">类别</text>
        <CategoryPicker v-model="category" />
      </view>

      <!-- 日期 -->
      <view class="form-section">
        <text class="form-label">日期</text>
        <view class="date-picker" @click="openDatePicker">
          <text class="date-text">{{ dateStr }}</text>
          <text class="date-arrow">▾</text>
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-section">
        <text class="form-label">备注</text>
        <textarea
          class="note-input"
          :value="note"
          placeholder="选填（最多200字）"
          placeholder-style="color: #b0b0b0; font-size: 28rpx;"
          :maxlength="200"
          :auto-height="true"
          :fixed="true"
          @input="onNoteInput"
        />
      </view>

      <!-- 保存按钮 -->
      <button class="save-btn" :disabled="!canSave" @click="onSave">
        记一笔
      </button>
    </view>

    <!-- 日期选择器：放在 form-card 外部，避免遮罩阻挡其他输入 -->
    <picker
      v-if="showDatePicker"
      mode="date"
      :value="dateStr"
      :end="todayStr"
      @change="onDateChange"
      @cancel="showDatePicker = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { Currency, Category } from '@/types'
import { getTodayStr } from '@/utils/helpers'
import { useExpenseStore } from '@/store/expense'
import AmountInput from '@/components/AmountInput.vue'
import CurrencyPicker from '@/components/CurrencyPicker.vue'
import CategoryPicker from '@/components/CategoryPicker.vue'

const store = useExpenseStore()

// 表单数据
const amount = ref(0)
const currency = ref<Currency>(Currency.CNY)
const category = ref<Category>(Category.LIVING)
const dateStr = ref(getTodayStr())
const note = ref('')
const showDatePicker = ref(false)

const todayStr = computed(() => getTodayStr())

const canSave = computed(() => amount.value > 0)

// 从 store 获取汇总
const totalCNY = computed(() => store.totalCNY)
const totalHKD = computed(() => store.totalHKD)
const totalUSD = computed(() => store.totalUSD)

onShow(() => {
  store.loadSummary()
})

function openDatePicker() {
  showDatePicker.value = true
}

function onNoteInput(e: { detail: { value: string } }) {
  note.value = e.detail.value
}

function onDateChange(e: { detail: { value: string } }) {
  dateStr.value = e.detail.value
  showDatePicker.value = false
}

async function onSave() {
  if (!canSave.value) return

  const success = await store.addExpense({
    amount: amount.value,
    currency: currency.value,
    category: category.value,
    date: dateStr.value,
    note: note.value.trim() || undefined,
  })

  if (success) {
    // 重置表单
    amount.value = 0
    note.value = ''
    uni.showToast({ title: '记账成功', icon: 'success', duration: 1500 })
  } else {
    uni.showToast({ title: '记账失败', icon: 'error', duration: 1500 })
  }
}
</script>

<style lang="scss" scoped>
.page-index {
  padding: 24rpx;
  padding-bottom: 80rpx;
}

.summary-bar {
  display: flex;
  justify-content: space-around;
  padding: 28rpx 16rpx;
  margin-bottom: 24rpx;
  background-color: $color-card;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-symbol {
  font-size: 22rpx;
  opacity: 0.7;
}

.summary-amount {
  font-size: 36rpx;
  font-weight: 700;
  margin-top: 4rpx;
}

.form-card {
  background-color: $color-card;
  border-radius: $radius-lg;
  padding: 36rpx 28rpx;
  box-shadow: $shadow-card;
}

.form-section {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text-light;
  margin-bottom: 12rpx;
}

.date-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border: 2rpx solid $color-border;
  border-radius: $radius-md;
  background-color: $color-bg;
}

.date-text {
  font-size: 30rpx;
  color: $color-text;
}

.date-arrow {
  font-size: 24rpx;
  color: $color-text-light;
}

.note-input {
  width: 100%;
  min-height: 140rpx;
  padding: 20rpx 24rpx;
  border: 2rpx solid $color-border;
  border-radius: $radius-md;
  background-color: #fff;
  font-size: 28rpx;
  color: $color-text;
  line-height: 1.5;
  box-sizing: border-box;
}

.save-btn {
  width: 100%;
  margin-top: 16rpx;
  padding: 24rpx;
  background-color: $color-primary;
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  border: none;
  border-radius: $radius-md;
  box-shadow: $shadow-btn;
  transition: opacity 0.2s;

  &[disabled] {
    opacity: 0.4;
  }

  &:active:not([disabled]) {
    opacity: 0.85;
  }
}
</style>
