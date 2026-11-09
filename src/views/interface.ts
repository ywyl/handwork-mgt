export interface PersonInfo {
  name: string
  age?: number
}

// export interface TaskInfo {
//   name: string
//   price: number
// }

export type WorkAction = '领取' | '回收'

export type TaskInfo = '包边' | '包角' | '包底'

export interface PersonWorkInfo {
  personName: Pick<PersonInfo, 'name'>
  taskName: TaskInfo
  action: WorkAction
  counts: number
  date: string
}
