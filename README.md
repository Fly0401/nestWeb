# 任务管理 (NestWeb)

基于 Vue 3 + TypeScript + Vite 构建的任务管理前端应用。

## 技术栈

- **Vue 3** — 渐进式 JavaScript 框架
- **TypeScript** — 类型安全的 JavaScript 超集
- **Vite** — 下一代前端构建工具
- **Vue Router** — 官方路由管理器
- **Pinia** — 轻量级状态管理
- **Axios** — HTTP 请求库
- **vue-tsc** — Vue 专属 TypeScript 类型检查

## 项目结构

```
nestWeb/
├── src/
│   ├── api/                  # API 接口层
│   │   ├── index.ts          # Axios 实例配置
│   │   └── types.ts          # 接口类型定义
│   ├── assets/
│   │   └── main.css          # 全局样式
│   ├── components/           # 公共组件
│   │   ├── TaskForm.vue      # 任务表单组件
│   │   └── TaskDetail.vue    # 任务详情组件
│   ├── router/
│   │   └── index.ts          # 路由配置
│   ├── stores/
│   │   └── task.ts           # Pinia 任务状态管理
│   ├── views/
│   │   └── TasksView.vue     # 任务列表视图
│   ├── App.vue               # 根组件
│   ├── env.d.ts              # 环境变量类型声明
│   └── main.ts               # 应用入口
├── index.html                # HTML 模板
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── dist/                     # 构建输出目录
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 功能特性

- 任务 CRUD 操作
- 响应式界面设计
- TypeScript 类型安全
- 模块化组件架构
