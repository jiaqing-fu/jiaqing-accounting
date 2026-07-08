/** 生成唯一 ID */
export function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}-${random}`
}

/** 获取当前日期字符串 YYYY-MM-DD */
export function getTodayStr(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** 获取当前月份的 YYYY-MM 格式 */
export function getCurrentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** 格式化 ISO 日期字符串为 YYYY-MM-DD */
export function formatISODate(isoStr: string): string {
  return isoStr.substring(0, 10)
}

/** 截断文本到指定长度 */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.substring(0, maxLen) + '...'
}
