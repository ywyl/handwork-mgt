export interface PersonInfo {
  name: string
  age?: number
}

export interface TaskInfo {
  name: string
  price: number
}

export interface PersonWorkInfo {
  personName: Pick<PersonInfo, 'name'>
  taskName: Pick<TaskInfo, 'name'>
  counts: number
  date: string
}

// TODO: 拿回去的东西是怎么算的，需不需要算包边包角一类
export interface PersonReceivedInfo {
  personName: Pick<PersonInfo, 'name'>
  taskName: Pick<TaskInfo, 'name'>
  counts: number
  date: string
}
