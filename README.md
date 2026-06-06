# DineArbiter

**基于大语言模型的群体餐饮决策支持系统**

> 让 AI 端水，公平公正公开

**演示视频**: [端水大师 — Bilibili](https://www.bilibili.com/video/BV1zfEJ6uEkb/)

## 项目简介

DineArbiter（端水大师）是一个 AI 驱动的群体餐饮决策微信小程序。当"吃什么"变成群聊里最纠结的问题时，DineArbiter 通过结构化偏好采集 + LLM 智能裁决，3 分钟搞定原本 30 分钟的决策。

## 核心流程

```
会话初始化 → 卡片式偏好采集 → AI 智能裁决
  (60s)        (30s/人)         (自动)
```

1. **会话初始化** — 创建房间，设定地点/人数/预算/底线
2. **偏好采集** — Tinder 式滑动表态：心动 / 避雷 / 随意
3. **AI 裁决** — DeepSeek V4 Pro 分析全量偏好，输出判决书 + 每人专属理由

## 技术架构

### 前端 — 微信小程序

- 4 页面视图层 (WXML + WXSS + JS)
- Canvas 2D 海报渲染引擎
- CSS Design Token 系统 (50+ 变量)
- LocalStorage 持久化层

### 后端 — 微信云开发

- **aiJudge** 云函数 — AI 裁决 + 追问对话
- **sessionManager** 云函数 — 会话管理
- DeepSeek V4 Pro API 集成
- 50 餐厅 + 24 标签知识库
- 标签匹配 + 冲突检测算法

### 三层容错降级

| Priority | 策略 | 说明 |
|----------|------|------|
| 1 | LLM API | DeepSeek V4 Pro 结构化 JSON 输出 |
| 2 | Cloud Local | 云函数端标签匹配 + 评分排序 |
| 3 | Client Local | 前端本地算法，零网络可用 |

## 项目结构

```
├── app.js / app.json / app.wxss   # 小程序入口
├── pages/
│   ├── index/                     # 首页
│   ├── create/                    # 创建会话
│   ├── vote/                      # 卡片式偏好采集
│   └── result/                    # AI 裁决结果
├── cloud/functions/
│   ├── aiJudge/                   # AI 裁决云函数
│   └── sessionManager/            # 会话管理云函数
├── utils/
│   ├── audio.js                   # 音频管理
│   ├── poster.js                  # 海报生成
│   ├── restaurant.js              # 餐厅知识库
│   └── util.js                    # 通用工具
├── presentation.html              # 项目介绍
└── project.config.json            # 小程序配置
```

## 部署指南

### 前置条件

- 微信开发者工具
- 微信云开发环境
- ModelScope API Key（用于 DeepSeek V4 Pro）

### 步骤

1. **克隆项目**

   ```bash
   git clone https://github.com/zhexiuinori/DineArbiter.git
   ```

2. **导入微信开发者工具**

   打开微信开发者工具 → 导入项目 → 选择项目目录

3. **开通云开发**

   在微信开发者工具中开通云开发，记录环境 ID

4. **配置环境 ID**

   在 `app.js` 中将 `env` 替换为你的云开发环境 ID：

   ```js
   wx.cloud.init({ env: '你的环境ID' })
   ```

5. **部署云函数**

   右键 `cloud/functions/aiJudge` → 上传并部署（云端安装依赖）

   右键 `cloud/functions/sessionManager` → 上传并部署（云端安装依赖）

6. **配置 API Key**

   在微信云开发控制台 → 云函数 → aiJudge → 环境变量中添加：

   ```
   MODELSCOPE_API_KEY=你的API Key
   ```

7. **安装云函数依赖**

   部署后云函数会自动安装 `wx-server-sdk` 和 `got`。如需本地调试，在各云函数目录下执行：

   ```bash
   npm install
   ```

## 研究贡献

- **C1 交互范式创新** — 卡片滑动式偏好采集，降低表态心理门槛
- **C2 LLM 裁决机制** — 个性化理由生成，群体最优 → 个体认同
- **C3 多维评分算法** — 标签匹配 + 冲突检测 + 预算约束 + 偏好加权
- **C4 容错架构设计** — 三层降级保障策略，任意环境持续可用

## 技术栈

- **AI Model**: DeepSeek V4 Pro (via ModelScope)
- **Frontend**: WeChat Mini Program (WXML / WXSS / JS)
- **Backend**: WeChat Cloud Development (Cloud Functions)
- **Design**: CSS Design Token System (Impeccable)

## License

MIT
