import { Router } from 'express'
import { ExpenseService } from '../services/expense'
import type { CreateExpenseInput, UpdateExpenseInput, ExpenseFilter } from '../models/expense'

const router = Router()
const service = new ExpenseService()

/** GET /expenses — 查询列表 */
router.get('/', (req, res) => {
  try {
    const filter: ExpenseFilter = {}
    if (req.query.month) filter.month = req.query.month as string
    if (req.query.currency) filter.currency = req.query.currency as ExpenseFilter['currency']
    if (req.query.category) filter.category = req.query.category as ExpenseFilter['category']
    const result = service.list(filter)
    res.json(result)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** GET /expenses/summary — 币种汇总 */
router.get('/summary', (req, res) => {
  try {
    const month = req.query.month as string | undefined
    const result = service.summary(month)
    res.json(result)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** GET /expenses/stats — 类别统计 */
router.get('/stats', (req, res) => {
  try {
    const month = req.query.month as string | undefined
    const currency = req.query.currency as string | undefined
    const result = service.categoryStats(month, currency)
    res.json(result)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** GET /expenses/:id — 单条查询 */
router.get('/:id', (req, res) => {
  try {
    const expense = service.getById(req.params.id)
    if (!expense) {
      return res.status(404).json({ error: '记录不存在' })
    }
    res.json(expense)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** POST /expenses — 创建花销 */
router.post('/', (req, res) => {
  try {
    const input: CreateExpenseInput = req.body

    // 校验必填字段
    if (!input.amount || input.amount <= 0) {
      return res.status(400).json({ error: '金额必须大于 0' })
    }
    if (!['CNY', 'HKD', 'USD'].includes(input.currency)) {
      return res.status(400).json({ error: '币种无效' })
    }
    if (!['生活花销', '交通通勤', '兴趣爱好', '其他'].includes(input.category)) {
      return res.status(400).json({ error: '类别无效' })
    }
    if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
      return res.status(400).json({ error: '日期格式无效 (YYYY-MM-DD)' })
    }
    if (input.note && input.note.length > 200) {
      return res.status(400).json({ error: '备注不能超过 200 字' })
    }

    const expense = service.create(input)
    res.status(201).json(expense)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** PUT /expenses/:id — 更新花销 */
router.put('/:id', (req, res) => {
  try {
    const input: UpdateExpenseInput = req.body

    if (input.amount !== undefined && input.amount <= 0) {
      return res.status(400).json({ error: '金额必须大于 0' })
    }
    if (input.currency && !['CNY', 'HKD', 'USD'].includes(input.currency)) {
      return res.status(400).json({ error: '币种无效' })
    }
    if (input.category && !['生活花销', '交通通勤', '兴趣爱好', '其他'].includes(input.category)) {
      return res.status(400).json({ error: '类别无效' })
    }
    if (input.date && !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
      return res.status(400).json({ error: '日期格式无效 (YYYY-MM-DD)' })
    }

    const expense = service.update(req.params.id, input)
    if (!expense) {
      return res.status(404).json({ error: '记录不存在' })
    }
    res.json(expense)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** DELETE /expenses/:id — 删除花销 */
router.delete('/:id', (req, res) => {
  try {
    const ok = service.remove(req.params.id)
    if (!ok) {
      return res.status(404).json({ error: '记录不存在' })
    }
    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router
