import { describe, it, expect, beforeEach } from 'vitest'
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js'

// ====== 模拟 database 模块 ======
let db: SqlJsDatabase

async function createTestDb(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs()
  const database = new SQL.Database()
  database.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL CHECK(amount > 0),
      currency TEXT NOT NULL CHECK(currency IN ('CNY', 'HKD', 'USD')),
      category TEXT NOT NULL CHECK(category IN ('生活花销', '交通通勤', '兴趣爱好', '其他')),
      date TEXT NOT NULL,
      note TEXT DEFAULT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  return database
}

// 模拟 getDb / saveToDisk
const databasePath = '../database'
let mockDb: SqlJsDatabase

vi.mock('../database', () => ({
  getDb: () => mockDb,
  saveToDisk: vi.fn(),
}))

import { ExpenseService } from './expense'

describe('ExpenseService', () => {
  let service: ExpenseService

  beforeEach(async () => {
    mockDb = await createTestDb()
    service = new ExpenseService()
  })

  describe('create', () => {
    it('creates an expense and returns it', () => {
      const expense = service.create({
        amount: 100,
        currency: 'CNY',
        category: '生活花销',
        date: '2026-07-08',
        note: '午餐',
      })

      expect(expense.id).toBeTruthy()
      expect(expense.amount).toBe(100)
      expect(expense.currency).toBe('CNY')
      expect(expense.category).toBe('生活花销')
      expect(expense.date).toBe('2026-07-08')
      expect(expense.note).toBe('午餐')
      expect(expense.created_at).toBeTruthy()
      expect(expense.updated_at).toBeTruthy()
    })

    it('creates expense without note', () => {
      const expense = service.create({
        amount: 50,
        currency: 'HKD',
        category: '交通通勤',
        date: '2026-07-01',
      })

      expect(expense.note).toBeNull()
    })
  })

  describe('list', () => {
    it('returns empty array when no expenses', () => {
      expect(service.list()).toEqual([])
    })

    it('returns all created expenses sorted by date desc', () => {
      service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-01' })
      service.create({ amount: 200, currency: 'HKD', category: '交通通勤', date: '2026-07-08' })
      service.create({ amount: 50, currency: 'USD', category: '兴趣爱好', date: '2026-06-15' })

      const list = service.list()
      expect(list).toHaveLength(3)
      expect(list[0].date).toBe('2026-07-08')
      expect(list[2].date).toBe('2026-06-15')
    })

    it('filters by month', () => {
      service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-01' })
      service.create({ amount: 200, currency: 'HKD', category: '交通通勤', date: '2026-06-01' })

      const list = service.list({ month: '2026-07' })
      expect(list).toHaveLength(1)
      expect(list[0].currency).toBe('CNY')
    })

    it('filters by currency', () => {
      service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-01' })
      service.create({ amount: 200, currency: 'HKD', category: '交通通勤', date: '2026-07-01' })

      const list = service.list({ currency: 'HKD' })
      expect(list).toHaveLength(1)
      expect(list[0].amount).toBe(200)
    })

    it('filters by category', () => {
      service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-01' })
      service.create({ amount: 50, currency: 'CNY', category: '其他', date: '2026-07-02' })

      const list = service.list({ category: '其他' })
      expect(list).toHaveLength(1)
      expect(list[0].category).toBe('其他')
    })

    it('combines multiple filters', () => {
      service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-01' })
      service.create({ amount: 200, currency: 'HKD', category: '生活花销', date: '2026-07-01' })
      service.create({ amount: 50, currency: 'CNY', category: '其他', date: '2026-06-01' })

      const list = service.list({ month: '2026-07', currency: 'CNY', category: '生活花销' })
      expect(list).toHaveLength(1)
      expect(list[0].amount).toBe(100)
    })
  })

  describe('getById', () => {
    it('returns expense by id', () => {
      const created = service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-08' })
      const found = service.getById(created.id)
      expect(found).not.toBeNull()
      expect(found!.amount).toBe(100)
    })

    it('returns null for non-existent id', () => {
      expect(service.getById('nonexistent')).toBeNull()
    })
  })

  describe('update', () => {
    it('updates amount', () => {
      const created = service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-08' })
      const updated = service.update(created.id, { amount: 200 })
      expect(updated!.amount).toBe(200)
    })

    it('updates note', () => {
      const created = service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-08', note: 'old' })
      const updated = service.update(created.id, { note: 'new note' })
      expect(updated!.note).toBe('new note')
    })

    it('returns null for non-existent id', () => {
      expect(service.update('nonexistent', { amount: 200 })).toBeNull()
    })

    it('partially updates — keeps unchanged fields', () => {
      const created = service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-08' })
      const updated = service.update(created.id, { amount: 200 })
      expect(updated!.currency).toBe('CNY')
      expect(updated!.category).toBe('生活花销')
      expect(updated!.date).toBe('2026-07-08')
    })
  })

  describe('remove', () => {
    it('removes an existing expense', () => {
      const created = service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-08' })
      expect(service.remove(created.id)).toBe(true)
      expect(service.getById(created.id)).toBeNull()
    })

    it('returns false for non-existent id', () => {
      expect(service.remove('nonexistent')).toBe(false)
    })
  })

  describe('summary', () => {
    it('returns summary grouped by currency', () => {
      service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-01' })
      service.create({ amount: 200, currency: 'CNY', category: '交通通勤', date: '2026-07-02' })
      service.create({ amount: 50, currency: 'HKD', category: '兴趣爱好', date: '2026-07-03' })

      const summary = service.summary()
      expect(summary).toHaveLength(2)

      const cny = summary.find(s => s.currency === 'CNY')!
      expect(cny.total).toBe(300)
      expect(cny.count).toBe(2)

      const hkd = summary.find(s => s.currency === 'HKD')!
      expect(hkd.total).toBe(50)
      expect(hkd.count).toBe(1)
    })

    it('filters summary by month', () => {
      service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-01' })
      service.create({ amount: 200, currency: 'CNY', category: '交通通勤', date: '2026-06-01' })

      const summary = service.summary('2026-06')
      expect(summary).toHaveLength(1)
      expect(summary[0].total).toBe(200)
    })

    it('returns empty array when no data', () => {
      expect(service.summary()).toEqual([])
    })
  })

  describe('categoryStats', () => {
    it('returns stats grouped by category', () => {
      service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-01' })
      service.create({ amount: 50, currency: 'CNY', category: '交通通勤', date: '2026-07-02' })

      const stats = service.categoryStats()
      expect(stats).toHaveLength(2)
      expect(stats[0].total).toBeGreaterThanOrEqual(stats[1].total) // sorted desc

      const living = stats.find(s => s.category === '生活花销')!
      expect(living.total).toBe(100)
      expect(living.percentage).toBeCloseTo(66.67, 1)
    })

    it('calculates correct percentages', () => {
      service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-01' })
      service.create({ amount: 100, currency: 'CNY', category: '交通通勤', date: '2026-07-01' })

      const stats = service.categoryStats()
      for (const s of stats) {
        expect(s.percentage).toBeCloseTo(50, 0)
      }
    })

    it('filters by currency', () => {
      service.create({ amount: 100, currency: 'CNY', category: '生活花销', date: '2026-07-01' })
      service.create({ amount: 50, currency: 'HKD', category: '生活花销', date: '2026-07-01' })

      const stats = service.categoryStats(undefined, 'HKD')
      expect(stats).toHaveLength(1)
      expect(stats[0].total).toBe(50)
    })

    it('returns empty array when no data', () => {
      expect(service.categoryStats()).toEqual([])
    })
  })
})
