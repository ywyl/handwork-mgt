import { contextBridge, ipcRenderer } from 'electron'
import { dataChannels } from '../src/shared/data.js'
import type { DataApi } from '../src/views/interface.js'

// 数据读写统一走主进程的 electron-store，渲染进程不直接接触文件系统
// ipcRenderer.invoke 失败时会带上 "Error invoking remote method 'xxx': Error: " 前缀，这里还原为业务错误信息
async function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  try {
    return (await ipcRenderer.invoke(channel, ...args)) as T
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(message.replace(/^Error invoking remote method '[^']+': (?:Error: )?/, ''), {
      cause: error,
    })
  }
}

const data: DataApi = {
  getAll: () => invoke(dataChannels.getAll),
  addPerson: (name) => invoke(dataChannels.addPerson, name),
  removePerson: (name) => invoke(dataChannels.removePerson, name),
  saveWorkType: (input) => invoke(dataChannels.saveWorkType, input),
  removeWorkType: (name) => invoke(dataChannels.removeWorkType, name),
  addWorkCount: (input) => invoke(dataChannels.addWorkCount, input),
  removeWorkCount: (key) => invoke(dataChannels.removeWorkCount, key),
}

// 通过 contextBridge 向渲染进程暴露一组受控、白名单化的 API
const api = {
  platform: process.platform,
  versions: {
    electron: process.versions.electron ?? '',
    chrome: process.versions.chrome ?? '',
    node: process.versions.node ?? '',
  },
  data,
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
