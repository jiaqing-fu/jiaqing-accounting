/**
 * 本地存储 — H5 端实现（localStorage）
 *
 * 本文件由 `storage.ts` 按平台调度。文件名中的平台后缀只表示用途，
 * 不需要任何条件编译指令——正因如此，它才受类型检查覆盖。
 */
import type { StorageAdapter } from './storage.adapter'

const storage: StorageAdapter = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('localStorage.setItem failed:', e)
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error('localStorage.removeItem failed:', e)
    }
  },
  clear(): void {
    try {
      localStorage.clear()
    } catch (e) {
      console.error('localStorage.clear failed:', e)
    }
  },
  keys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keys.push(key)
    }
    return keys
  },
}

export default storage
