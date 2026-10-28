import { app, BrowserWindow, shell } from 'electron'
import { join } from 'node:path'

// 开发模式（由 vite-plugin-electron 注入 VITE_DEV_SERVER_URL）
const isDev = !!process.env.VITE_DEV_SERVER_URL

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    title: 'Handwork Mgt',
    backgroundColor: '#0a0f1e',
    webPreferences: {
      // 预加载脚本（CJS 内容，需配合沙箱模式加载）
      preload: join(import.meta.dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 外部链接一律交给系统默认浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    // 开发模式：加载 Vite Dev Server
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    // 生产模式：加载构建产物（file://）
    mainWindow.loadFile(join(import.meta.dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // macOS：点击 Dock 图标且无窗口时重新创建窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // macOS 除外，关闭所有窗口后退出应用
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
