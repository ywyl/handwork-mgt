# Handwork Mgt

基于 **Electron + Vue 3 + Vite + TypeScript + SheetJS** 的跨平台桌面表格处理项目（由 `electron-three` 模板派生，已移除 Three.js 相关内容）。

## 技术栈

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Vue 3](https://cn.vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vite.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript 超集
- [SheetJS (xlsx)](https://sheetjs.com/) - 电子表格读写与解析
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Vue Router](https://router.vuejs.org/) - 官方路由
- [Pinia](https://pinia.vuejs.org/) - 状态管理
- [Sass](https://sass-lang.com/) - CSS 预处理器

## 功能

- Electron 桌面窗口（主进程 + Preload 安全桥接，`contextIsolation` 开启）
  - 关于页展示运行时环境（操作系统 / Electron / Chromium / Node 版本）
- 首页：Excel 导入 → 表格预览与编辑 → 导出 xlsx
  - 支持 `.xlsx` / `.xls` / `.csv`，首行作为表头
  - 多工作表切换
  - 单元格编辑、新增行、删除行
  - 导出为新 Excel（Electron 下弹出系统保存对话框）
- 顶部页签导航由路由表动态生成（首页 / 关于固定常驻）

## 关于 SheetJS

npm 上的 `xlsx` 只到 0.18.5 且已停止更新，官方推荐从 SheetJS CDN 安装：

```bash
npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

本项目的 `package.json` 中已固定该地址，`npm install` 会直接拉取。

- 读写逻辑集中在 `src/utils/excel.ts`：`readWorkbook`（ArrayBuffer → 工作簿）、`sheetToRows`（工作表 → 行对象）、`rowsToSheet`、`exportRows`（生成 Blob 并触发下载）
- 表格状态（文件信息、工作表列表、行数据）由 `src/stores/records.ts` 中的 Pinia store 管理

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器并拉起 Electron 窗口（主进程改动自动热重启）
npm run dev

# 类型检查并构建（生成 dist/ 渲染层 + dist-electron/ 主进程与预加载）
npm run build

# 从 Electron 运行已构建的产物（需先 npm run build）
npm start

# 代码检查
npm run lint

# 代码格式化
npm run format
```

> 提示：若需生成可分发的安装包，可在此基础之上引入 `electron-builder` 并配置打包脚本。

## 目录结构

```
handwork-mgt/
├── electron/               # Electron 进程代码
│   ├── main.ts             # 主进程入口（创建窗口、加载页面）
│   └── preload.ts          # 预加载脚本（contextBridge 暴露受控 API）
├── public/
│   └── vite.svg
├── src/
│   ├── assets/             # 静态资源
│   ├── router/index.ts     # 路由配置（Hash 模式，兼容 file://）
│   ├── stores/records.ts   # Pinia：Excel 数据状态
│   ├── styles/             # 全局样式与变量
│   ├── types/env.d.ts      # 类型声明（含 window.electronAPI）
│   ├── utils/excel.ts      # SheetJS 读写封装
│   ├── views/Home.vue      # Excel 导入 / 编辑 / 导出
│   ├── views/About.vue     # 关于页（技术栈 + 运行环境）
│   ├── App.vue             # 顶部导航
│   └── main.ts             # 应用入口
├── vite.config.ts          # Vite + vite-plugin-electron 配置
├── eslint.config.js
├── tsconfig.*.json
└── package.json
```

## 与 electron-three 的差异

- 移除 `three`、`@types/three`、`dat.gui`、`@types/dat.gui` 及 3D 场景页面（`Home.vue` 的 Three.js 场景、`GuiDemo.vue`）
- 新增 `xlsx`（SheetJS），新增 `src/utils/excel.ts`、`src/stores/records.ts`
- 首页改为 Excel 导入导出；应用名、窗口标题与页面标题改为 **Handwork Mgt**
- 其余工程配置（Vite、Electron 插件、ESLint / Prettier、TS、Element Plus、Pinia、路由页签机制）保持一致
