import express from 'express'
import cors from 'cors'
import { initDatabase } from './database'
import expenseRoutes from './routes/expense'

async function main() {
  // 初始化数据库
  await initDatabase()

  const app = express()
  const PORT = process.env.PORT || 3000

  // 中间件
  app.use(cors())
  app.use(express.json())

  // 路由
  app.use('/api/expenses', expenseRoutes)

  // 健康检查
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', name: '嘉庆记账 API', version: '1.0.0' })
  })

  // 404
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' })
  })

  // 启动
  app.listen(PORT, () => {
    console.log(`🧾 嘉庆记账 API 已启动: http://localhost:${PORT}`)
    console.log(`   GET  http://localhost:${PORT}/api/health`)
    console.log(`   POST http://localhost:${PORT}/api/expenses`)
  })
}

main().catch((err) => {
  console.error('启动失败:', err)
  process.exit(1)
})

export default {}
