<template>
  <view class="app">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('嘉庆记账 App 启动')
})
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  background-color: $color-bg;
  color: $color-text;
  font-size: $font-md;
  min-height: 100vh;
}
</style>
