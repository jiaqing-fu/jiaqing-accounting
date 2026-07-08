<template>
  <view class="page-settings">
    <!-- 导出数据 -->
    <view class="section">
      <text class="section-title">数据管理</text>
      <view class="menu-item" @click="onExportCSV">
        <text class="menu-label">导出 CSV</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="onClearData">
        <text class="menu-label danger">清空所有数据</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="section">
      <text class="section-title">关于</text>
      <view class="menu-item">
        <text class="menu-label">版本</text>
        <text class="menu-value">v1.0.0</text>
      </view>
      <view class="menu-item">
        <text class="menu-label">技术框架</text>
        <text class="menu-value">uni-app + Vue 3</text>
      </view>
    </view>

    <!-- 反馈 -->
    <view class="section">
      <text class="section-title">反馈与帮助</text>
      <view class="menu-item" @click="onFeedback">
        <text class="menu-label">意见反馈</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="footer">
      <text class="footer-text">嘉庆记账 — 让每一笔花销都清晰可见</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useExpenseStore } from '@/store/expense'

const store = useExpenseStore()

function onExportCSV() {
  const expenses = store.expenses
  if (expenses.length === 0) {
    uni.showToast({ title: '暂无数据可导出', icon: 'none' })
    return
  }

  const BOM = '﻿'
  const header = '日期,币种,类别,金额,备注\n'
  const rows = expenses.map(e => {
    let note = (e.note ?? '').replace(/"/g, '""')
    // 防御 CSV 公式注入：以 = + - @ 开头的单元格前加单引号
    if (/^[=+\-@]/.test(note)) note = `'${note}`
    return `${e.date},${e.currency},${e.category},${e.amount.toFixed(2)},"${note}"`
  }).join('\n')

  const csv = BOM + header + rows

  // #ifdef H5
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `嘉庆记账_${store.currentMonth}.csv`
  a.click()
  URL.revokeObjectURL(url)
  uni.showToast({ title: '导出成功', icon: 'success' })
  // #endif

  // #ifdef MP-WEIXIN
  uni.shareFileMessage({
    filePath: '',
    fileName: `嘉庆记账_${store.currentMonth}.csv`,
    success: () => { uni.showToast({ title: '请选择保存方式', icon: 'none' }) },
    fail: () => {
      uni.setClipboardData({
        data: csv,
        success: () => { uni.showToast({ title: 'CSV 已复制到剪贴板', icon: 'success' }) },
      })
    },
  })
  // #endif
}

function onClearData() {
  uni.showModal({
    title: '危险操作',
    content: '确认清空所有花销数据？此操作不可恢复！',
    confirmText: '确认清空',
    confirmColor: '#e94560',
    success: async (res) => {
      if (res.confirm) {
        const ids = store.expenses.map(e => e.id)
        for (const id of ids) {
          await store.removeExpense(id)
        }
        uni.showToast({ title: '数据已清空', icon: 'success' })
      }
    },
  })
}

function onFeedback() {
  // #ifdef MP-WEIXIN
  uni.showToast({ title: '可通过微信客服反馈', icon: 'none' })
  // #endif
  // #ifdef H5
  uni.showToast({ title: '反馈功能开发中', icon: 'none' })
  // #endif
}
</script>

<style lang="scss" scoped>
.page-settings {
  padding: $spacing-md;
  padding-bottom: 80rpx;
}

.section {
  background-color: $color-card;
  border-radius: $radius-md;
  margin-bottom: $spacing-md;
  overflow: hidden;
  box-shadow: $shadow-card;
}

.section-title {
  display: block;
  padding: $spacing-md $spacing-md $spacing-sm;
  font-size: $font-xs;
  color: $color-text-light;
  text-transform: uppercase;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  border-bottom: 1px solid $color-bg;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: $color-bg;
  }
}

.menu-label {
  font-size: $font-md;
  color: $color-text;

  &.danger {
    color: $color-primary;
  }
}

.menu-value {
  font-size: $font-sm;
  color: $color-text-light;
}

.menu-arrow {
  font-size: $font-lg;
  color: $color-text-light;
}

.footer {
  display: flex;
  justify-content: center;
  padding: $spacing-xl 0;
}

.footer-text {
  font-size: $font-xs;
  color: $color-text-light;
}
</style>
