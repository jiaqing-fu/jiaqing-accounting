/**
 * 本地存储 — 微信小程序端实现（uni.storage 同步 API）
 *
 * 本文件由 `storage.ts` 按平台调度。文件名中的平台后缀只表示用途，
 * 不需要任何条件编译指令——正因如此，它才受类型检查覆盖。
 */
import type { StorageAdapter } from './storage.adapter'

const storage: StorageAdapter = {
  get<T>(key: string): T | null {
    try {
      const raw = uni.getStorageSync(key)
      if (raw === '') return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  set(key: string, value: unknown): void {
    try {
      uni.setStorageSync(key, JSON.stringify(value))
    } catch (e) {
      console.error('uni.setStorageSync failed:', e)
    }
  },
  remove(key: string): void {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      console.error('uni.removeStorageSync failed:', e)
    }
  },
  clear(): void {
    try {
      uni.clearStorageSync()
    } catch (e) {
      console.error('uni.clearStorageSync failed:', e)
    }
  },
  keys(): string[] {
    try {
      return uni.getStorageInfoSync().keys
    } catch {
      return []
    }
  },
}

export default storage
