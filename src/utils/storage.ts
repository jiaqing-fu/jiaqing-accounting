/**
 * 本地存储 — 平台调度入口
 *
 * 调用方一律 `import storage from '@/utils/storage'`，不需要知道自己跑在哪个平台。
 *
 * 这里刻意**不用** `// #ifdef` 条件编译。原因是条件编译对 tsc 只是注释，
 * 两个平台分支同时可见会被判定为「重复声明」，导致整个文件游离在类型检查之外。
 * 改用 `process.env.UNI_PLATFORM`：uni-app 在构建时把它内联为字符串字面量
 * （实测产物中 `process.env` 出现次数为 0），未命中的分支会被摇掉，
 * 效果与条件编译等价，但 tsc 能完整读懂。
 */
import h5Storage from './storage.h5'
import mpStorage from './storage.mp'
import type { StorageAdapter } from './storage.adapter'

const storage: StorageAdapter =
  process.env.UNI_PLATFORM === 'h5' ? h5Storage : mpStorage

export default storage
export type { StorageAdapter }
