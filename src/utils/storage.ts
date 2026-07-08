/**
 * 本地存储封装
 * H5 端使用 localStorage，小程序端使用 uni.storage API
 */

// #ifdef H5
const storage = {
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
// #endif

// #ifdef MP-WEIXIN
const storage = {
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
// #endif

export default storage
