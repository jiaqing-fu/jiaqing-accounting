import { getDb, saveToDisk } from '../database'
import type { Expense, CreateExpenseInput, UpdateExpenseInput, ExpenseFilter, ExpenseSummary, CategoryStats } from '../models/expense'

/** 生成简单 ID */
function generateId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 10)
  return `${ts}-${rand}`
}

/** 将 sql.js 结果行映射为 Expense */
function mapRow(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    amount: row.amount as number,
    currency: row.currency as Expense['currency'],
    category: row.category as Expense['category'],
    date: row.date as string,
    note: (row.note as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

/** 执行查询并返回结果数组（位置参数） */
function queryAll(sql: string, params: (string | number | null)[] = []): Record<string, unknown>[] {
  const db = getDb()
  const stmt = db.prepare(sql)
  try {
    stmt.bind(params)
    const rows: Record<string, unknown>[] = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as Record<string, unknown>)
    }
    return rows
  } finally {
    stmt.free()
  }
}

/** 执行写操作（位置参数） */
function execute(sql: string, params: (string | number | null)[]): void {
  const db = getDb()
  const stmt = db.prepare(sql)
  try {
    stmt.bind(params)
    stmt.step()
  } finally {
    stmt.free()
    saveToDisk()
  }
}

export class ExpenseService {
  /** 查询花销列表 */
  list(filter?: ExpenseFilter): Expense[] {
    const conditions: string[] = []
    const params: (string | number | null)[] = []

    if (filter?.month) {
      conditions.push('date LIKE ?')
      params.push(`${filter.month}%`)
    }
    if (filter?.currency) {
      conditions.push('currency = ?')
      params.push(filter.currency)
    }
    if (filter?.category) {
      conditions.push('category = ?')
      params.push(filter.category)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const sql = `SELECT * FROM expenses ${where} ORDER BY date DESC, created_at DESC`
    return queryAll(sql, params).map(mapRow)
  }

  /** 创建花销 */
  create(input: CreateExpenseInput): Expense {
    const id = generateId()
    const now = new Date().toISOString()

    execute(
      `INSERT INTO expenses (id, amount, currency, category, date, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, input.amount, input.currency, input.category, input.date, input.note ?? null, now, now]
    )

    return this.getById(id)!
  }

  /** 更新花销 */
  update(id: string, input: UpdateExpenseInput): Expense | null {
    const existing = this.getById(id)
    if (!existing) return null

    const sets: string[] = []
    const params: (string | number | null)[] = []

    if (input.amount !== undefined) { sets.push('amount = ?'); params.push(input.amount) }
    if (input.currency !== undefined) { sets.push('currency = ?'); params.push(input.currency) }
    if (input.category !== undefined) { sets.push('category = ?'); params.push(input.category) }
    if (input.date !== undefined) { sets.push('date = ?'); params.push(input.date) }
    if (input.note !== undefined) { sets.push('note = ?'); params.push(input.note) }

    sets.push('updated_at = ?')
    params.push(new Date().toISOString())
    params.push(id) // WHERE id = ?

    execute(`UPDATE expenses SET ${sets.join(', ')} WHERE id = ?`, params)
    return this.getById(id)!
  }

  /** 删除花销 */
  remove(id: string): boolean {
    const before = queryAll('SELECT COUNT(*) as cnt FROM expenses WHERE id = ?', [id])
    if (!before[0] || (before[0].cnt as number) === 0) return false
    execute('DELETE FROM expenses WHERE id = ?', [id])
    return true
  }

  /** 根据 ID 获取 */
  getById(id: string): Expense | null {
    const rows = queryAll('SELECT * FROM expenses WHERE id = ?', [id])
    return rows.length > 0 ? mapRow(rows[0]) : null
  }

  /** 币种汇总 */
  summary(month?: string): ExpenseSummary[] {
    let sql = 'SELECT currency, SUM(amount) as total, COUNT(*) as count FROM expenses'
    const params: (string | number | null)[] = []

    if (month) {
      sql += ' WHERE date LIKE ?'
      params.push(`${month}%`)
    }
    sql += ' GROUP BY currency'

    return queryAll(sql, params).map((r: Record<string, unknown>) => ({
      currency: r.currency as ExpenseSummary['currency'],
      total: Math.round((r.total as number) * 100) / 100,
      count: r.count as number,
    }))
  }

  /** 类别统计 */
  categoryStats(month?: string, currency?: string): CategoryStats[] {
    const conditions: string[] = []
    const params: (string | number | null)[] = []

    if (month) { conditions.push('date LIKE ?'); params.push(`${month}%`) }
    if (currency) { conditions.push('currency = ?'); params.push(currency) }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const sql = `SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses ${where} GROUP BY category`

    const rows = queryAll(sql, params)
    const grandTotal = rows.reduce((sum: number, r: Record<string, unknown>) => sum + (r.total as number), 0)

    return rows.map((r: Record<string, unknown>) => ({
      category: r.category as CategoryStats['category'],
      total: Math.round((r.total as number) * 100) / 100,
      percentage: grandTotal > 0 ? Math.round(((r.total as number) / grandTotal) * 10000) / 100 : 0,
      count: r.count as number,
    })).sort((a, b) => b.total - a.total)
  }
}
