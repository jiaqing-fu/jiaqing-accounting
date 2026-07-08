/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts'],
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
