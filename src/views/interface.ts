export type WorkAction = '领取' | '回收'

/** 人员：姓名唯一 */
export interface Person {
  name: string
}

/** 工作类型：名称唯一，price 为单件价格（元） */
export interface WorkType {
  name: string
  price: number
}

/** 工作明细：某个工作类型 + 动作的数量 */
export interface WorkCount {
  workTypeName: string
  action: WorkAction
  counts: number
}

/** 工作记录：以「人名 + 日期」为唯一值，一条记录内包含多个工作明细 */
export interface WorkRecord {
  personName: string
  date: string
  items: WorkCount[]
}

/** electron-store 中持久化的完整数据结构 */
export interface AppData {
  persons: Person[]
  workTypes: WorkType[]
  workRecords: WorkRecord[]
}

/** 新增 / 累加工作明细时的入参 */
export interface WorkCountInput extends WorkCount {
  personName: string
  date: string
}

/** 删除工作明细时的唯一键 */
export type WorkCountKey = Omit<WorkCountInput, 'counts'>

export interface WorkTypeInput {
  name: string
  price: number
  /** 编辑时传入原名称，改名后会同步更新工作记录中的类型名称 */
  originalName?: string
}

/** 主进程（IPC + electron-store）与浏览器（localStorage）实现的同一套数据接口 */
export interface DataApi {
  getAll(): Promise<AppData>
  addPerson(name: string): Promise<AppData>
  removePerson(name: string): Promise<AppData>
  saveWorkType(input: WorkTypeInput): Promise<AppData>
  removeWorkType(name: string): Promise<AppData>
  addWorkCount(input: WorkCountInput): Promise<AppData>
  removeWorkCount(input: WorkCountKey): Promise<AppData>
}
