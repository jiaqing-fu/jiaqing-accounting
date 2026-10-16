# 嘉庆记账

> 极简跨境消费记账工具 — 支持人民币 / 港币 / 美元三币种记账

[![CI](https://github.com/jiaqing-fu/jiaqing-accounting/actions/workflows/ci.yml/badge.svg)](https://github.com/jiaqing-fu/jiaqing-accounting/actions/workflows/ci.yml)
[![uni-app](https://img.shields.io/badge/uni--app-3.x-2b9939?logo=vue.js)](https://uniapp.dcloud.net.cn/)
[![Vue](https://img.shields.io/badge/Vue-3.4-4fc08d?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![Electron](https://img.shields.io/badge/Electron-28+-47848f?logo=electron)](https://www.electronjs.org/)

---

## 平台

| 平台 | 运行方式 |
|------|----------|
| 🖥️ **Windows 桌面** | H5 前端 + 本地 Express 后端 + Electron 桌面壳（`.exe` 打包未做） |
| 📱 **微信小程序** | uni-app 编译为微信小程序原生代码，数据存 `uni.storage` |

---

## 功能

- **多币种记账** — 人民币 (CNY)、港币 (HKD)、美元 (USD)
- **四类花销** — 生活花销、交通通勤、兴趣爱好、其他
- **账单列表** — 按日期倒序，支持月份 / 币种筛选，按币种分别统计当月合计
- **数据统计** — 各币种当月汇总卡片 + 类别占比横向条形图（可按币种切换）
- **数据管理** — 编辑 / 删除花销，CSV 导出（含公式注入防护）
- **本地优先** — 桌面端存 SQLite，小程序端存 `uni.storage`，不依赖网络

> 未实现的功能（月度趋势图、云同步、微信登录等）在 [CLAUDE.md](./CLAUDE.md) 中标注为 🚧。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | uni-app (Vue 3 Composition API) |
| 状态管理 | Pinia |
| 构建工具 | Vite 5 |
| 后端 | Express 4（TypeScript） |
| 数据存储 | SQLite (sql.js) · `uni.storage` |
| 桌面端 | Electron 28+ |
| 语言 | TypeScript |
| 测试 | Vitest |

---

## 快速开始

### 环境要求

- Node.js 24（与 CI 固定的版本一致）
- npm 9+

### 安装依赖

```bash
# 前端
npm ci

# 后端
cd server && npm ci && cd ..
```

### 启动开发

```bash
# H5 前端（浏览器预览 http://localhost:8080）
npm run dev:h5

# 微信小程序（需微信开发者工具打开 dist/dev/mp-weixin）
npm run dev:mp-weixin

# 后端 API（端口 3000）
npm run dev:server

# Electron 桌面端（先构建 H5 产物，再拉起壳）
npm run build:h5
npm run dev:electron
```

### 后端 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/expenses` | 查询花销列表 |
| POST | `/api/expenses` | 新增花销 |
| PUT | `/api/expenses/:id` | 修改花销 |
| DELETE | `/api/expenses/:id` | 删除花销 |
| GET | `/api/expenses/summary` | 币种汇总 |
| GET | `/api/expenses/stats` | 类别统计 |

---

## 项目结构

```
├── src/                     # uni-app 前端
│   ├── pages/               # 记账页 / 账单列表 / 数据统计 / 设置
│   ├── components/          # 公共组件（全部手写，未用 UI 库）
│   ├── store/               # Pinia 状态管理
│   ├── api/                 # 接口层（HTTP / uni.storage 双实现，按平台分流）
│   └── utils/               # 工具函数、存储适配、平台常量
├── server/                  # Express 后端
│   └── src/
│       ├── database/        # SQLite (sql.js)
│       ├── models/          # 数据模型
│       ├── services/        # 业务逻辑（含单测）
│       └── routes/          # API 路由
├── electron/                # Electron 桌面壳
├── .github/workflows/       # CI（单测 + 类型检查 + 构建）与云端 @claude 问答
├── .husky/                  # git hooks：pre-commit 跑单测，pre-push 跑 CI 同款
├── CHANGELOG.md             # 更新日志
└── CLAUDE.md                # 完整产品文档
```

---

## 开发

```bash
# H5 + 后端同时运行
npm run dev:h5
npm run dev:server
# 浏览器打开 http://localhost:8080

# 小程序编译监听
npm run dev:mp-weixin
# 微信开发者工具 → 导入 dist/dev/mp-weixin
```

### 提交前的自动检查

husky 已挂钩，无需手动跑：

- `pre-commit`：前后端单元测试（约 3.4s）
- `pre-push`：单测 + 类型检查 + 三端构建，与 CI 同一组命令（约 25s）

### 质量门禁

`npm run typecheck`（vue-tsc）是独立的一关：三端构建（`build:*`）只转译、**不做类型检查**，构建通过 ≠ 类型正确。

CI（`.github/workflows/ci.yml`，推 master 或提 PR 时触发）三个 job 必须全绿：**单元测试** / **类型检查** / **构建验证**（小程序 + H5 + 后端）。

### 云端问答

在 issue / PR 评论里写 `@claude 你的问题`，云端 Claude 会读代码后回帖——只读，不能改代码。细节与凭据轮换见 [CLAUDE.md §9.3](./CLAUDE.md)。

---

详细设计文档见 [CLAUDE.md](./CLAUDE.md)，版本变更见 [CHANGELOG.md](./CHANGELOG.md)。
