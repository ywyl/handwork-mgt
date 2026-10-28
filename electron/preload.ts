import { contextBridge } from 'electron'

// 通过 contextBridge 向渲染进程暴露一组受控、白名单化的 API
const api = {
  platform: process.platform,
  versions: {
    electron: process.versions.electron ?? '',
    chrome: process.versions.chrome ?? '',
    node: process.versions.node ?? '',
  },
} as const

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error('exposeInMainWorld failed:', error)
  }
} else {
  // 未开启上下文隔离时（不推荐）直接挂载到全局对象
  ;(globalThis as unknown as { electronAPI: typeof api }).electronAPI = api
}
