# 嘉庆记账

> 极简跨境消费记账工具 — 支持人民币 / 港币 / 美元三币种记账

[![uni-app](https://img.shields.io/badge/uni--app-3.x-2b9939?logo=vue.js)](https://uniapp.dcloud.net.cn/)
[![Vue](https://img.shields.io/badge/Vue-3.4-4fc08d?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![Electron](https://img.shields.io/badge/Electron-28+-47848f?logo=electron)](https://www.electronjs.org/)

---

## 平台

| 平台 | 运行方式 |
|------|----------|
| 🖥️ **Windows 桌面** | H5 开发模式 + 计划 Electron 打包为 .exe |
| 📱 **微信小程序** | uni-app 编译为微信小程序原生代码 |

---

## 功能

- **多币种记账** — 人民币 (CNY)、港币 (HKD)、美元 (USD)
- **四类花销** — 生活花销、交通通勤、兴趣爱好、其他
- **账单列表** — 按日期倒序，支持月份 / 币种筛选
- **数据统计** — 币种汇总 + 类别占比图表
- **数据管理** — 本地 SQLite 存储，支持 CSV 导出

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | uni-app (Vue 3 Composition API) |
| 状态管理 | Pinia |
| 构建工具 | Vite 5 |
| 后端 | Express (sql.js — 纯 WASM SQLite) |
| 桌面端 | Electron 28+ |
| 图表 | uCharts |
| 语言 | TypeScript |

---

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
# 前端
npm install

# 后端
cd server && npm install && cd ..
```

### 启动开发

```bash
# H5 前端（浏览器预览）
npm run dev:h5

# 微信小程序（需微信开发者工具打开 dist/dev/mp-weixin）
npm run dev:mp-weixin

# 后端 API（端口 3000）
npm run dev:server
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
│   ├── pages/
│   │   ├── index/           # 记账页
│   │   ├── list/            # 账单列表
│   │   ├── stats/           # 数据统计
│   │   └── settings/        # 设置
│   ├── components/          # 公共组件
│   ├── store/               # Pinia 状态管理
│   ├── api/                 # API 接口层
│   └── utils/               # 工具函数
├── server/                  # Express 后端
│   └── src/
│       ├── database/        # SQLite (sql.js)
│       ├── services/        # 业务逻辑
│       └── routes/          # API 路由
├── electron/                # Electron 桌面壳
├── cloudfunctions/          # 微信云函数
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

详细设计文档见 [CLAUDE.md](./CLAUDE.md)。
