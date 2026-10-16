/**
 * 存储适配器契约
 *
 * 存在的意义是让两个平台的实现必须保持同一副接口：
 * 一旦 `.h5.ts` 与 `.mp.ts` 的方法签名出现分歧，`npm run typecheck` 会立刻报错。
 */
export interface StorageAdapter {
  get<T>(key: string): T | null
  set(key: string, value: unknown): void
  remove(key: string): void
  clear(): void
  keys(): string[]
}
