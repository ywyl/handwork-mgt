# Handwork Mgt

基于 **Electron + Vue 3 + Vite + TypeScript + electron-store** 的跨平台桌面工作记录管理项目（由 `electron-three` 模板派生，已移除 Three.js 相关内容）。

## 技术栈

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Vue 3](https://cn.vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vite.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript 超集
- [electron-store](https://github.com/sindresorhus/electron-store) - 主进程本地数据持久化
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Vue Router](https://router.vuejs.org/) - 官方路由
- [Pinia](https://pinia.vuejs.org/) - 状态管理
- [Sass](https://sass-lang.com/) - CSS 预处理器

## 功能

- Electron 桌面窗口（主进程 + Preload 安全桥接，`contextIsolation` 开启）
  - 关于页展示运行时环境（操作系统 / Electron / Chromium / Node 版本）
- 首页：本地数据总览
  - 人员数、工作类型数、工作记录数、工作明细数、累计数量与金额，并按人员汇总
- 添加页：人员（姓名唯一）→ 工作类型（名称 + 单价）→ 工作信息（姓名 / 日期 / 工作类型 / 领取或回收 / 数量）
- 人员管理页：按人员查看工作记录、单价与金额汇总
- 数据持久化到 electron-store，启动时自动加载
- 顶部页签导航由路由表动态生成（首页 / 关于固定常驻）

## 本地数据存储

数据由主进程的 [electron-store](https://github.com/sindresorhus/electron-store) 保存为 JSON，文件名为 `handwork-data.json`，位于 Electron 的 `userData` 目录（应用名来自 `package.json` 的 `name`，因此开发与打包后路径一致）：

- Windows：`%APPDATA%\handwork-mgt\handwork-data.json`
- macOS：`~/Library/Application Support/handwork-mgt/handwork-data.json`
- Linux：`~/.config/handwork-mgt/handwork-data.json`

> 文件是纯 JSON，可直接用文本编辑器查看或备份；手动修改前请先关闭应用，否则运行中的应用会以内存中的数据覆盖文件。
>
> `electron-store` 会被 Vite 一并打进 `dist-electron/main.js`，打包时无需额外携带 `node_modules`。

包含 3 个数据结构（定义见 `src/views/interface.ts`）：

| 结构 | 字段 | 约束 |
| --- | --- | --- |
| `persons` | `name` | 姓名唯一 |
| `workTypes` | `name`、`price` | 名称唯一，`price` 为单件价格（元） |
| `workRecords` | `personName`、`date`、`items[]` | 唯一键为「人名 + 日期」；`items` 每项为 `{ workTypeName, action, counts }` |

工作记录示例：

```json
{
  "personName": "张三",
  "date": "2026-11-10",
  "items": [
    { "workTypeName": "包边", "action": "领取", "counts": 30 },
    { "workTypeName": "包边", "action": "回收", "counts": 28 },
    { "workTypeName": "包角", "action": "领取", "counts": 10 }
  ]
}
```

- 同一人、同一天只会有一条记录；重复录入同一「工作类型 + 动作」会自动累加数量
- 删除某条明细后，若该记录已无明细，整条「人 + 日期」记录会自动移除
- 读取时会自动把旧版扁平记录（`id`、`workTypeName`、`action`、`counts`）迁移成 `items` 结构，历史数据不会丢失

读写链路：

1. 主进程 `electron/dataStore.ts` 创建 store 并注册 `data:*` IPC（校验与增删改逻辑在 `src/shared/data.ts`）
2. 预加载脚本 `electron/preload.ts` 通过 `contextBridge` 暴露 `window.electronAPI.data`
3. 渲染层 `src/stores/data.ts`（Pinia）统一调用这些接口；纯浏览器环境自动退回 `localStorage`，便于预览调试

删除人员或工作类型时，若已被工作记录引用会被拒绝，避免产生孤儿数据；改名工作类型会同步更新历史记录。

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

# 仅生成未压缩的打包目录（release/win-unpacked/），用于快速验证
npm run pack

# 打包 Windows 安装包 + 免安装便携版（产物输出到 release/）
npm run dist:win

# 按当前操作系统打包（Windows 上等同于 dist:win）
npm run dist

# 代码检查
npm run lint

# 代码格式化
npm run format
```

> 若通过 npmmirror 安装依赖后打包时下载 Electron 很慢，可先设置镜像：`$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"`。

## 打包成 exe

打包使用 [electron-builder](https://www.electron.build/)，配置见 [electron-builder.yml](./electron-builder.yml)：

- 入口：`dist-electron/main.js`（生产环境加载 `dist/index.html`，即 Vite 构建产物）
- 打包范围：仅包含 `dist/`、`dist-electron/` 与 `package.json`，运行时依赖已被 Vite 打进产物，无需携带 `node_modules`
- 输出目录：`release/`

执行 `npm run dist:win` 后得到：

| 文件 | 说明 |
| --- | --- |
| `release/HandworkMgt-<version>-setup.exe` | NSIS 安装包，可选安装目录，创建桌面 / 开始菜单快捷方式 |
| `release/HandworkMgt-<version>-portable.exe` | 免安装便携版，双击即可运行 |
| `release/win-unpacked/` | 未压缩的应用目录，便于排查问题（`Handwork Mgt.exe`） |
| `release/latest.yml`、`*.blockmap` | 更新元数据 / 增量包，可用于后续自动更新 |

可自定义的部分：

- **应用图标**：将 256×256 的 `icon.ico` 放到 `build/` 目录后再打包，未提供时使用 Electron 默认图标
- **版本号**：修改 `package.json` 的 `version`，安装包文件名会随之变化
- **代码签名**：当前未配置证书，Windows 可能提示“未知发布者”。正式分发可配置 `CSC_LINK` / `CSC_KEY_PASSWORD` 环境变量（或 CI 签名服务）后重新打包
- **仅打安装包 / 仅打便携版**：在 `electron-builder.yml` 的 `win.target` 中删掉不需要的目标即可

## 目录结构

```
handwork-mgt/
├── electron/               # Electron 进程代码
│   ├── main.ts             # 主进程入口（注册 IPC、创建窗口、加载页面）
│   ├── dataStore.ts        # electron-store 实例 + 数据读写 IPC
│   └── preload.ts          # 预加载脚本（contextBridge 暴露受控 API）
├── build/                  # 打包资源（可选：放置 icon.ico 作为应用图标）
├── release/                # electron-builder 打包产物（不提交）
├── public/
│   └── vite.svg
├── src/
│   ├── assets/             # 静态资源
│   ├── router/index.ts     # 路由配置（Hash 模式，兼容 file://）
│   ├── services/dataApi.ts # 浏览器环境的 localStorage 兜底实现
│   ├── shared/data.ts      # 数据校验与增删改纯函数（主进程 / 渲染层共用）
│   ├── stores/data.ts      # Pinia：人员 / 工作类型 / 工作记录状态
│   ├── styles/             # 全局样式与变量
│   ├── types/env.d.ts      # 类型声明（含 window.electronAPI）
│   ├── views/Add.vue       # 人员 / 工作类型 / 工作信息录入
│   ├── views/Personnel.vue # 人员工作记录与金额汇总
│   ├── views/Home.vue      # 本地数据总览与按人员汇总
│   ├── views/interface.ts  # 3 个数据结构与数据 API 类型
│   ├── views/About.vue     # 关于页（技术栈 + 运行环境）
│   ├── App.vue             # 侧边导航
│   └── main.ts             # 应用入口
├── vite.config.ts          # Vite + vite-plugin-electron 配置
├── electron-builder.yml    # electron-builder 打包配置
├── eslint.config.js
├── tsconfig.*.json
└── package.json
```

## 与 electron-three 的差异

- 移除 `three`、`@types/three`、`dat.gui`、`@types/dat.gui` 及 3D 场景页面（`Home.vue` 的 Three.js 场景、`GuiDemo.vue`）
- 新增 `electron-store`，新增 `electron/dataStore.ts`、`src/shared/data.ts`、`src/stores/data.ts`
- 首页改为本地数据总览与按人员汇总；新增人员 / 工作类型 / 工作信息录入页
- 应用名、窗口标题与页面标题改为 **Handwork Mgt**
- 其余工程配置（Vite、Electron 插件、ESLint / Prettier、TS、Element Plus、Pinia、路由页签机制）保持一致
