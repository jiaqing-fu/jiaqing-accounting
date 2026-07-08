---
name: unit-test
description: 为嘉庆记账项目编写和运行单元测试。覆盖 Vue 组件、Pinia store、工具函数、后端服务和 API 路由。
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# 单元测试技能

为「嘉庆记账」项目编写和维护单元测试。

## 技术栈

| 端 | 框架 | 运行器 |
|----|------|--------|
| 前端 (src/) | Vitest + @vue/test-utils + jsdom | `npx vitest` |
| 后端 (server/) | Vitest + supertest | `npx vitest` |

## 执行流程

### Step 1: 确认测试基础设施

检查项目是否已安装测试依赖。若未安装，执行：

```bash
# 前端
npm install -D vitest @vue/test-utils jsdom

# 后端
cd server && npm install -D vitest supertest @types/supertest
```

### Step 2: 检查 vitest 配置

若项目缺少 `vitest.config.ts`，创建之。前端需配置：
- `environment: 'jsdom'`
- `alias` 指向 `@/` → `src/`
- `globals: true`

后端需配置为 Node 环境，测试文件使用 `.test.ts` 后缀。

### Step 3: 分析目标代码

在执行测试前，先 Read 被测试的源代码，理解：
- 函数签名和返回值
- 边界条件（空输入、null、极端值）
- 平台分支（`#ifdef H5` / `#ifdef MP-WEIXIN`）
- 依赖项（需 mock 的模块）

### Step 4: 编写测试

测试文件放在 `__tests__/` 或与源文件同目录的 `*.test.ts`。

#### 前端组件测试模板

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ComponentName from '@/components/ComponentName.vue'

describe('ComponentName', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ComponentName, { props: { ... } })
    expect(wrapper.exists()).toBe(true)
  })
})
```

#### 后端服务测试模板

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { ExpenseService } from '../services/expense'
// 使用 sql.js 内存数据库

describe('ExpenseService', () => {
  let service: ExpenseService

  beforeAll(() => { service = new ExpenseService() })

  it('creates an expense', () => {
    const expense = service.create({ amount: 100, currency: 'CNY', ... })
    expect(expense.amount).toBe(100)
  })
})
```

### Step 5: 运行测试

```bash
# 前端测试
npx vitest run

# 后端测试
cd server && npx vitest run

# 监听模式
npx vitest
```

### Step 6: 报告结果

汇总：通过数 / 失败数 / 跳过数。失败用例列出具体错误。

## 测试覆盖重点

| 模块 | 关键测试点 |
|------|-----------|
| AmountInput | 合法输入、小数限制、空输入、blur 格式化 |
| CurrencyPicker | 三币种渲染、v-model 更新、active 状态 |
| CategoryPicker | 四类别渲染、选择切换 |
| ExpenseItem | 金额格式化、币种符号、备注截断 |
| expense store | add/remove/edit/loadAll、筛选逻辑、空状态 |
| helpers.ts | generateId 唯一性、getTodayStr 格式、getCurrentMonth |
| currency.ts | getCurrencySymbol 三币种、formatAmount |
| ExpenseService | CRUD 操作、按月筛选、汇总统计、类别统计 |
| Expense routes | POST 校验、PUT 部分更新、DELETE 幂等 |
