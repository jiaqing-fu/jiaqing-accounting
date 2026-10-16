# 嘉庆记账 — 产品文档

> **文档约定**：本文混有「设计意图」与「已实现事实」，二者此前发生过偏离并误导过工作。
> 现已标注状态：**✅ 已实现**（代码中可验证） · **🚧 未实现**（仅设计意图，尚未编码）。
> 未标注状态的功能视为 ✅。修改代码后请同步更新本文，尤其不要在未实现项上停留模糊表述。

---

## 一、产品概述

| 属性 | 内容 |
|------|------|
| **产品名称** | 嘉庆记账 |
| **产品定位** | 极简跨境消费记账工具 |
| **目标平台** | Windows 桌面端 + 微信小程序 |
| **核心价值** | 支持多币种（人民币/港币/美元）的日常开销记录，简单纯粹，无冗余功能 |

---

## 二、目标用户

- 经常往返内地与香港的跨境人群
- 需要同时管理人民币、港币、美元三种货币支出的用户
- 追求简单、快速记账体验的个人用户

---

## 三、核心功能

### 3.1 花销记录（核心功能）

每笔花销记录包含以下字段：

| 字段 | 说明 |
|------|------|
| **金额** | 数字，保留两位小数 |
| **币种** | 人民币 (CNY) / 港币 (HKD) / 美元 (USD)，三选一 |
| **类别** | 生活花销 / 交通通勤 / 兴趣爱好 / 其他，四选一 |
| **日期** | 花销日期，默认当天 |
| **备注** | 可选，自由文本（上限200字） |

### 3.2 花销列表

- 按日期倒序展示所有花销记录（SQL 层 `ORDER BY date DESC, created_at DESC`）
- 支持按月筛选
- 支持按币种筛选
- 显示当月合计金额（按币种分别统计）
- 🚧 **按类别筛选** —— 数据层已具备（`ExpenseFilter.category`、store 的 `setFilterCategory`），但列表页无对应 UI 控件，用户无法触达

### 3.3 数据统计

- 当月各币种总支出概览
- 类别占比图（**横向条形图**，非饼图；可按币种切换）
- 🚧 **月度趋势折线图** —— 未实现，`stats.vue` 中无任何图表库或 canvas 代码

### 3.4 数据管理

- 数据本地存储：Windows 端为 SQLite（sql.js），小程序端为 `uni.storage`
- 支持导出 CSV（含公式注入防护；H5 端直接下载，小程序端复制到剪贴板）
- 支持编辑/删除已记录的花销
- 🚧 **数据云端同步（微信云开发）** —— 未实现。小程序端实际经由 `src/utils/storage.ts` 写入本地缓存，两端数据各自独立

### 3.5 未来可扩展功能（V1 暂不实现）

- 预算管理
- 周期性账单（订阅/房租等）
- 多账本
- 家庭成员共享
- 汇率换算

---

## 四、技术方案对比

以下是四种可行的技术方案，请从中选择一种：

---

### 方案 A：uni-app + Node.js 后端

**技术栈：** uni-app (Vue 3) + uniCloud / Node.js (Express) + SQLite/MySQL

| 平台 | 实现方式 |
|------|----------|
| 微信小程序 | uni-app 编译为微信小程序原生代码 |
| Windows 桌面 | uni-app 编译为 H5，使用 Electron 打包为 Windows 桌面应用 |

| 维度 | 评价 |
|------|------|
| 代码复用率 | ⭐⭐⭐⭐⭐ 一套代码，两个平台 |
| 开发效率 | ⭐⭐⭐⭐⭐ 中国最主流跨端框架，社区资源极丰富 |
| 小程序兼容性 | ⭐⭐⭐⭐⭐ uni-app 对微信小程序支持最成熟 |
| 桌面端体验 | ⭐⭐⭐ Electron 方案略重（安装包 ~80MB），但功能完整 |
| 学习成本 | ⭐⭐⭐⭐ Vue 3 语法，上手友好 |
| 生态 & 插件 | ⭐⭐⭐⭐⭐ 插件市场丰富，UI 库（uView）可直接使用 |
| 长期维护 | ⭐⭐⭐⭐⭐ 背靠 DCloud，企业级长期支持 |

**优点：**
- 一套代码覆盖小程序和桌面端，开发成本最低
- 国内主流方案，社区活跃，遇到问题容易找到解决方案
- 丰富的 UI 组件库可直接使用（uView、uni-ui）
- 支持条件编译，可按平台定制不同行为

**缺点：**
- Electron 打包体积较大
- 桌面端无法完全达到原生 Windows 应用的体验
- 深度依赖 uni-app 生态，迁移成本高

---

### 方案 B：Taro (React) + Node.js 后端

**技术栈：** Taro 4.x (React 18) + Node.js (NestJS) + SQLite/MySQL

| 平台 | 实现方式 |
|------|----------|
| 微信小程序 | Taro 编译为微信小程序原生代码 |
| Windows 桌面 | Taro H5 模式 + Electron 打包 |

| 维度 | 评价 |
|------|------|
| 代码复用率 | ⭐⭐⭐⭐⭐ 一套代码，两个平台 |
| 开发效率 | ⭐⭐⭐⭐ React 生态，但小程序适配插件较少 |
| 小程序兼容性 | ⭐⭐⭐⭐ 成熟度稍逊 uni-app，但持续改善 |
| 桌面端体验 | ⭐⭐⭐ 同 Electron 方案 |
| 学习成本 | ⭐⭐⭐ 需要熟悉 React + Taro 特有 API |
| 生态 & 插件 | ⭐⭐⭐⭐ React 生态庞大，但 Taro 专属资源较少 |
| 长期维护 | ⭐⭐⭐⭐⭐ 京东维护，大型企业背书 |

**优点：**
- React 技术栈，团队成员若熟悉 React 上手快
- JSX/TSX 写法现代，类型支持好
- 京东维护，有企业级保障
- 后端可搭配 NestJS 获得更好的架构设计

**缺点：**
- Taro 在微信小程序端的成熟度不如 uni-app
- React 开发者在国内相对较少
- 同样有 Electron 体积大的问题

---

### 方案 C：Flutter + 独立微信小程序

**技术栈：** Flutter (Dart) + Node.js 后端，微信小程序独立开发

| 平台 | 实现方式 |
|------|----------|
| 微信小程序 | 原生微信小程序或 uni-app 单独开发 |
| Windows 桌面 | Flutter Windows 原生编译 |

| 维度 | 评价 |
|------|------|
| 代码复用率 | ⭐⭐ 两套代码，仅共享后端 API |
| 开发效率 | ⭐⭐ 需要分别开发两套客户端 |
| 小程序兼容性 | ⭐⭐⭐⭐ 原生开发，体验最好 |
| 桌面端体验 | ⭐⭐⭐⭐⭐ 原生 Windows 应用，性能最佳 |
| 学习成本 | ⭐⭐⭐ Dart 语言，团队需要额外学习 |
| 生态 & 插件 | ⭐⭐⭐ Flutter 中国生态在发展中 |
| 长期维护 | ⭐⭐⭐⭐ Google 维护，但国内生态相对弱 |

**优点：**
- Windows 端原生编译，性能和体验最佳
- Flutter UI 表现力强，动画流畅
- 一次学习，可扩展到 iOS/Android

**缺点：**
- 两套代码库，开发和维护成本翻倍
- Flutter 在中国市场（尤其是小程序生态）的适配有限
- 多数记账类功能不需要 Flutter 级别的动画性能
- 团队需要掌握 Dart 语言

---

### 方案 D：微信小程序云开发（纯微信生态）

**技术栈：** 微信原生小程序 + 微信云开发（云函数 + 云数据库），Windows 端通过微信 PC 版小程序运行

| 平台 | 实现方式 |
|------|----------|
| 微信小程序 | 原生微信小程序开发 |
| Windows 桌面 | 微信 PC 客户端直接运行小程序（Windows 原生支持） |

| 维度 | 评价 |
|------|------|
| 代码复用率 | ⭐⭐⭐⭐⭐ 只有一套代码，Windows 端直接跑小程序 |
| 开发效率 | ⭐⭐⭐⭐⭐ 无需 Electron，无需额外适配 |
| 小程序兼容性 | ⭐⭐⭐⭐⭐ 原生开发，100% 兼容 |
| 桌面端体验 | ⭐⭐⭐ 微信 PC 小程序窗口运行，无法独立打开 |
| 学习成本 | ⭐⭐⭐ 需学习微信小程序开发规范 |
| 生态 & 插件 | ⭐⭐⭐⭐ 微信生态内资源充足 |
| 长期维护 | ⭐⭐⭐⭐⭐ 微信官方维护 |
| 后端成本 | ⭐⭐⭐⭐⭐ 云开发自带后端，无需独立部署服务器 |

**优点：**
- 真正的一套代码，零额外适配 Windows
- 微信 PC 版已原生支持运行小程序，用户无需额外安装
- 微信云开发提供数据库、云函数、存储一站式后端
- 用户数据天然与微信账号绑定，多端同步无缝
- 开发周期最短，成本最低
- 无需打包、签名、分发 Windows 安装包

**缺点：**
- Windows 端必须依赖微信客户端，无法独立运行
- 小程序有包体积限制（主包 2MB，总包 20MB）
- 云开发绑定腾讯云，存在供应商锁定
- 小程序审核需要符合微信规范
- 离开微信生态后数据迁移有门槛

---

## 五、方案对比总结

| 维度 | 方案 A (uni-app) | 方案 B (Taro) | 方案 C (Flutter) | 方案 D (纯小程序) |
|------|:--:|:--:|:--:|:--:|
| 代码复用率 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 开发效率 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 桌面体验 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 生态成熟度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 维护成本 | 中 | 中 | 高 | 低 |
| 上手难度 | 低 | 中 | 高 | 低 |
| 预估开发周期 | 3-4 周 | 4-5 周 | 6-8 周 | 2-3 周 |

---

## 六、推荐

> **首选方案 D（微信小程序云开发）**：如果用户接受 "Windows 上通过微信 PC 版使用小程序" 的体验方式，这是开发成本最低、维护最简单的方案。微信 PC 客户端在 Windows 上的体验已经相当成熟。
>
> **次选方案 A（uni-app + Electron）**：如果用户坚持需要一个独立的 Windows 桌面应用（.exe），uni-app 是最成熟的中国跨端方案。

> ⚠️ 以上是当时的推荐结论。**最终选定的是方案 A**，依据见第十节。

---

## 七、数据模型设计

### 7.1 花销记录表 (expenses)

```typescript
interface Expense {
  id: string;           // 唯一标识
  amount: number;       // 金额（保留两位小数）
  currency: Currency;   // 币种
  category: Category;   // 花销类别
  date: string;         // 日期 YYYY-MM-DD
  note?: string;        // 备注（可选，最长 200 字）
  createdAt: string;    // 创建时间（ISO datetime）
  updatedAt: string;    // 更新时间（ISO datetime）
}

enum Currency {
  CNY = 'CNY',  // 人民币 ¥
  HKD = 'HKD',  // 港币 HK$
  USD = 'USD',  // 美元 $
}

enum Category {
  LIVING = '生活花销',       // 餐饮、购物、日用品、房租等
  TRANSPORT = '交通通勤',    // 公交、地铁、打车、加油等
  HOBBY = '兴趣爱好',        // 娱乐、运动、旅行、学习等
  OTHER = '其他',            // 不归属以上三类的支出
}
```

### 7.2 用户表 (users) 🚧 未实现

> 代码中不存在任何用户或登录实现：`src/types/index.ts` 无 `User` 类型，全项目无 `wx.login` / OpenID 调用。以下仅为设计意图，未编码。

```typescript
interface User {
  openId: string;       // 微信 OpenID
  nickname: string;     // 昵称
  avatarUrl: string;    // 头像
  createdAt: Date;      // 注册时间
}
```

---

## 八、界面设计（关键页面）

| 页面 | 功能描述 |
|------|----------|
| **首页/记账页** | 金额输入、币种选择、类别选择、日期、备注输入、保存按钮 |
| **账单列表页** | 按时间倒序展示，支持月份/币种筛选，显示各币种当月合计。🚧 类别筛选无 UI（见 §3.2） |
| **统计页** | 类别占比**横向条形图** + 各币种汇总，支持币种切换。🚧 月度趋势未实现（见 §3.3） |
| **设置页** | 数据导出（CSV）、关于、反馈（桌面端仅提示"开发中"，见 §10.4） |

---

## 九、开发规范

- 所有代码使用 **TypeScript** 编写
- 组件化开发，复用的 UI 元素抽离为独立组件
- API 层与业务逻辑分离
- 提交信息使用中文，格式：`[类型] 简要描述`
- **整个项目期间严格遵守本 CLAUDE.md 中记录的设计决策**

### 9.1 平台差异一律用 `UNI_PLATFORM` 常量，禁用新的 `#ifdef`

需要区分平台时，写成 `process.env.UNI_PLATFORM === 'h5' ? a : b`（uni-app 构建时会把它内联为字面量 `"h5"` / `"mp-weixin"`，未命中分支被摇掉，效果与条件编译等价）。

**不要再用 `// #ifdef` 写平台分支。** 原因：条件编译指令对 tsc 只是注释，同一文件里的两个平台分支会被判定「重复声明」，整个文件从此游离在类型检查之外——`npm run typecheck` 是瞎的，而三端构建只转译不检查类型，CI 全绿也不代表代码是好的。历史上有两个文件因这个原因完全不受检查，其中 `stats.vue` 藏着一处无限递归直到门禁上线才暴露。

遗留：`src/pages/settings/settings.vue` 内仍有 `#ifdef` 块，但均为无重复声明的语句块，对类型检查无害，暂未改动。

### 9.2 提交前自查

`npm run typecheck` 必须通过。它已接入 CI 的 typecheck job 与 `.husky/pre-push`，本地过不了就推不上去。

### 9.3 云端 `@claude` 问答（只读）

在 issue / PR 评论里写 `@claude 你的问题`，云端 Claude 会读代码后回帖（`.github/workflows/claude.yml`）。

**它是只读的，四道锁**（均为实测结论，非设计意图）：
1. 工作流 `permissions` 里没有 `contents: write` —— 没有推代码的凭据；
2. `checkout` 用 `persist-credentials: false` —— token 不会落进工作区的 `.git/config`；
3. CLI `--tools` 硬收窄工具表 —— `Write`/`Edit`/`WebFetch` 等工具在会话里**不存在**；
4. 精确白名单 + `--permission-prompts none` —— 白名单外一律自动拒绝（实测：`curl`、重定向、`A && curl` 复合命令全部被拒，进程正常退出不挂住）。

**信任边界**：只有 `OWNER`/`MEMBER`/`COLLABORATOR` 的评论能触发；但 issue 正文、PR 正文与 diff **任何人都能写**，对 Claude 而言是不可信输入。工作流用随机 nonce 把这段内容划界并声明为数据，但**别把秘密放进任何会被它读到的文本里**。

**凭据**：`ANTHROPIC_AUTH_TOKEN`（仓库 secret，DeepSeek key）+ `ANTHROPIC_BASE_URL`（仓库 variable）+ 可选 `CLAUDE_MODEL`（variable，默认 `deepseek-flash`）。
轮换：DeepSeek 侧换 key 后，`gh secret set ANTHROPIC_AUTH_TOKEN --repo jiaqing-fu/jiaqing-accounting`（交互式输入，别用 `--body`，否则会进 shell 历史）。想临时停用就删掉该 secret——工作流会因缺凭据失败，但不会做任何危险操作。

**注意**：`issue_comment` 用的是**默认分支上**的工作流文件，所以**合并即上线**，没有"先推分支试跑"；改这个工作流必须走 PR 合并才生效。手动验证可用 `gh workflow run claude.yml -f issue_number=N`。

---

## 十、已确认技术方案 ✅

### 10.1 方案选择

> **✅ 已选定方案 A：uni-app (Vue 3) + Node.js 后端 + Electron 桌面端**

### 10.2 技术栈明细

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | uni-app (Vue 3) | 3.x | 跨端核心框架 |
| **状态管理** | Pinia | 2.x | Vue 3 官方推荐 |
| **UI 组件库** | 无（手写） | — | 🚧 原计划的 uni-ui 未引入；组件均为 `src/components/` 下手写 |
| **构建工具** | Vite | 5.x | uni-app 3.x 默认以 Vite 驱动 |
| **后端框架** | Express | 4.x | 轻量级 Node.js 框架 |
| **数据库** | SQLite (sql.js) | 1.10.3 | Windows 本地存储；纯 WASM，无需原生编译 |
| **桌面端** | Electron | 28+ | 将 H5 打包为 Windows .exe |
| **小程序后端** | 无（uni.storage 本地缓存） | — | 🚧 原计划的微信云开发未实现 |
| **图表库** | 无 | — | 🚧 原计划的 uCharts 未引入；类别占比为 CSS 条形图 |
| **语言** | TypeScript | 5.x | 全体代码类型化 |

### 10.3 项目目录结构

```
项目根目录
├── src/                        # uni-app 前端源码
│   ├── pages/                  # 页面目录
│   │   ├── index/              # 首页 — 记账入口
│   │   ├── list/               # 账单列表
│   │   ├── stats/              # 数据统计
│   │   └── settings/           # 设置
│   ├── components/             # 公共组件（全部手写，未用 UI 库）
│   │   ├── CurrencyPicker.vue  # 币种选择器
│   │   ├── CategoryPicker.vue  # 类别选择器
│   │   ├── AmountInput.vue     # 金额输入
│   │   └── ExpenseItem.vue     # 花销列表项
│   ├── store/
│   │   └── expense.ts          # Pinia 花销 store
│   ├── api/
│   │   ├── expense.ts          # 花销 API 调度入口（按 UNI_PLATFORM 选用实现）
│   │   ├── expense.h5.ts       # H5 实现：HTTP 请求本地 Express
│   │   ├── expense.mp.ts       # 小程序实现：读写 uni.storage
│   │   └── expense.types.ts    # 两端都必须满足的 ExpenseApi 契约
│   ├── types/
│   │   └── index.ts            # Currency / Category / Expense 等类型与元数据
│   ├── utils/
│   │   ├── currency.ts         # 币种格式化
│   │   ├── helpers.ts          # 通用工具
│   │   ├── storage.ts          # 本地存储调度入口（按 UNI_PLATFORM 选用实现）
│   │   ├── storage.h5.ts       # localStorage 实现
│   │   ├── storage.mp.ts       # uni.storage 实现
│   │   ├── storage.adapter.ts  # 两端都必须满足的 StorageAdapter 契约
│   │   └── uni-event.ts        # uni-app 组件事件 ↔ DOM 事件的类型桥
│   ├── App.vue                 # 应用入口
│   ├── main.ts                 # 主入口文件
│   ├── env.d.ts                # 类型声明
│   ├── pages.json              # uni-app 页面配置
│   ├── manifest.json           # 跨端配置
│   └── uni.scss                # 全局样式变量
├── server/                     # Node.js 后端（Windows 端）
│   ├── src/
│   │   ├── routes/expense.ts   # 花销路由
│   │   ├── models/expense.ts   # 花销数据模型
│   │   ├── services/expense.ts # 花销业务逻辑（含 expense.test.ts）
│   │   ├── database/index.ts   # SQLite（sql.js）初始化
│   │   └── index.ts            # 服务入口
│   ├── package.json
│   └── tsconfig.json
├── electron/                   # Electron 桌面端壳
│   ├── main.js                 # 主进程：拉起后端、加载 H5 产物、CSV 存盘 IPC
│   ├── preload.js              # 预加载脚本
│   └── package.json            # electron-builder 打包配置
├── .github/
│   ├── workflows/ci.yml        # CI：单测 + 类型检查 + 三端构建
│   ├── workflows/claude.yml    # 云端 @claude 只读问答（见 §9.3）
│   └── claude-answer-system.md # 云端应答者的系统提示（只读契约）
├── .husky/                     # git hooks（pre-commit / pre-push）
├── .claude/                    # 项目 agents 与 skills
├── CHANGELOG.md
├── README.md
├── package.json                # 前端项目配置
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── index.html                  # H5 入口模板
└── CLAUDE.md                   # 项目文档（本文件）
```

### 10.4 平台差异处理策略

| 能力 | Windows (Electron) | 微信小程序 |
|------|:---:|:---:|
| 数据存储 | SQLite（sql.js）本地数据库 | `uni.storage` 本地缓存 |
| 用户认证 | 本地免登录 | 🚧 微信一键登录——未实现，当前同为免登录 |
| 数据同步 | 作为数据源，提供 API | 🚧 未实现，当前写入本地缓存 |
| 导出 CSV | 直接写入本地文件（IPC 存盘） | 复制到剪贴板 |
| 平台分流 | `process.env.UNI_PLATFORM` 常量调度（见 §9.1） | 同一入口取另一实现 |

### 10.5 数据存储策略

- **Windows 端**：Electron 主进程拉起本地 Express 服务（`server/dist/index.js`，端口 3000），数据存 SQLite（sql.js），完全本地化，无需网络
- **小程序端**：数据写入 `uni.storage` 本地缓存（🚧 原计划的微信云开发未实现）
- **V1 不实现两端数据互通**，各自独立使用

---

## 十一、待决策事项

- [ ] **是否支持汇率换算**：V1 可暂不支持，用户手动计算
- [ ] **数据备份策略**：Windows 端本地备份 vs 云端同步

---

> **文档版本：** v1.4  
> **最后更新：** 2026-10-16  
> **状态：** ✅ v1.0.0 已发布（2026-10-16）。功能清单已逐条对照代码核实，未实现项标注为 🚧。
> v1.3 起项目启用类型门禁（`npm run typecheck`），平台分流改用 §9.1 的常量调度。
> v1.4 起支持云端 `@claude` 只读问答（见 §9.3）。
