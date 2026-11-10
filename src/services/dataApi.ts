import {
  addPerson,
  addWorkCount,
  emptyData,
  normalizeData,
  removePerson,
  removeWorkCount,
  removeWorkType,
  saveWorkType,
} from '@/shared/data'
import type { AppData, DataApi } from '@/views/interface'

const STORAGE_KEY = 'handwork-mgt:data'

function readLocal(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    return normalizeData(JSON.parse(raw))
  } catch {
    return emptyData()
  }
}

function writeLocal(data: AppData): AppData {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return data
}

/**
 * Electron 环境使用 preload 暴露的 electron-store 接口；
 * 纯浏览器环境（如 `npm run preview`）退回 localStorage，保证页面仍可运行。
 */
export function createDataApi(): DataApi {
  const electronApi = window.electronAPI?.data
  if (electronApi) return electronApi

  return {
    getAll: async () => readLocal(),
    addPerson: async (name) => writeLocal(addPerson(readLocal(), name)),
    removePerson: async (name) => writeLocal(removePerson(readLocal(), name)),
    saveWorkType: async (input) => writeLocal(saveWorkType(readLocal(), input)),
    removeWorkType: async (name) => writeLocal(removeWorkType(readLocal(), name)),
    addWorkCount: async (input) => writeLocal(addWorkCount(readLocal(), input)),
    removeWorkCount: async (key) => writeLocal(removeWorkCount(readLocal(), key)),
  }
}
