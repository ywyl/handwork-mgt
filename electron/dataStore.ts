import { ipcMain } from 'electron'
import Store from 'electron-store'
import type { AppData } from '../src/views/interface.js'
import {
  addPerson,
  addWorkCount,
  dataChannels,
  emptyData,
  normalizeData,
  removePerson,
  removeWorkCount,
  removeWorkType,
  saveWorkType,
} from '../src/shared/data.js'

let store: Store<AppData> | undefined

/** 懒初始化：electron-store 依赖 app.getPath('userData')，需在 app ready 之后使用 */
function getStore(): Store<AppData> {
  store ??= new Store<AppData>({
    name: 'handwork-data',
    defaults: emptyData(),
  })
  return store
}

function readData(): AppData {
  // normalizeData 同时负责旧结构（扁平记录）到新结构（person + date + items）的迁移
  return normalizeData(getStore().store)
}

function persist(update: (data: AppData) => AppData): AppData {
  const next = update(readData())
  getStore().store = next
  return next
}

export function registerDataHandlers(): void {
  ipcMain.handle(dataChannels.getAll, () => readData())
  ipcMain.handle(dataChannels.addPerson, (_event, name: string) =>
    persist((data) => addPerson(data, name)),
  )
  ipcMain.handle(dataChannels.removePerson, (_event, name: string) =>
    persist((data) => removePerson(data, name)),
  )
  ipcMain.handle(dataChannels.saveWorkType, (_event, input: Parameters<typeof saveWorkType>[1]) =>
    persist((data) => saveWorkType(data, input)),
  )
  ipcMain.handle(dataChannels.removeWorkType, (_event, name: string) =>
    persist((data) => removeWorkType(data, name)),
  )
  ipcMain.handle(dataChannels.addWorkCount, (_event, input: Parameters<typeof addWorkCount>[1]) =>
    persist((data) => addWorkCount(data, input)),
  )
  ipcMain.handle(
    dataChannels.removeWorkCount,
    (_event, key: Parameters<typeof removeWorkCount>[1]) =>
      persist((data) => removeWorkCount(data, key)),
  )
}
