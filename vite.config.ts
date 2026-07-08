import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  base: './',
  plugins: [uni()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
