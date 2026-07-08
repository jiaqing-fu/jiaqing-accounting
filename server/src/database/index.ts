import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js'
import fs from 'fs'
import path from 'path'

const DB_DIR = path.join(__dirname, '..', '..', 'data')
const DB_PATH = path.join(DB_DIR, 'jiaqing.db')

let db: SqlJsDatabase

/** 初始化数据库（在应用启动时调用） */
export async function initDatabase(): Promise<SqlJsDatabase> {
  // 确保数据目录存在
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }

  const SQL = await initSqlJs()

  // 从文件加载已有数据库，或创建新数据库
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  // 建表
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL CHECK(amount > 0),
      currency TEXT NOT NULL CHECK(currency IN ('CNY', 'HKD', 'USD')),
      category TEXT NOT NULL CHECK(category IN ('生活花销', '交通通勤', '兴趣爱好', '其他')),
      date TEXT NOT NULL,
      note TEXT DEFAULT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  db.run('CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);')
  db.run('CREATE INDEX IF NOT EXISTS idx_expenses_currency ON expenses(currency);')
  db.run('CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);')

  // 持久化到磁盘
  saveToDisk()

  console.log(`📦 数据库已初始化: ${DB_PATH}`)
  return db
}

/** 获取数据库实例 */
export function getDb(): SqlJsDatabase {
  if (!db) throw new Error('数据库未初始化，请先调用 initDatabase()')
  return db
}

/** 持久化到磁盘 */
export function saveToDisk(): void {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(DB_PATH, buffer)
}

export default { initDatabase, getDb, saveToDisk }
