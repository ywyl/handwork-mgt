import type {
  AppData,
  Person,
  WorkCount,
  WorkCountInput,
  WorkCountKey,
  WorkRecord,
  WorkType,
  WorkTypeInput,
} from '../views/interface.js'

/** 主进程 IPC 通道名（主进程与预加载脚本共用，避免字符串拼写不一致） */
export const dataChannels = {
  getAll: 'data:get-all',
  addPerson: 'data:persons:add',
  removePerson: 'data:persons:remove',
  saveWorkType: 'data:work-types:save',
  removeWorkType: 'data:work-types:remove',
  addWorkCount: 'data:work-counts:add',
  removeWorkCount: 'data:work-counts:remove',
} as const

export function emptyData(): AppData {
  return { persons: [], workTypes: [], workRecords: [] }
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * 兼容旧版扁平记录（每人每天每类型各一条）：
 * 旧数据 { personName, date, workTypeName, action, counts } → 新结构 { personName, date, items: [...] }
 */
export function normalizeData(input: unknown): AppData {
  const source = (input ?? {}) as {
    persons?: unknown
    workTypes?: unknown
    workRecords?: unknown
  }

  const persons: Person[] = []
  if (Array.isArray(source.persons)) {
    for (const raw of source.persons) {
      const name = String((raw as Partial<Person> | null)?.name ?? '').trim()
      if (name && !persons.some((person) => person.name === name)) {
        persons.push({ name })
      }
    }
  }

  const workTypes: WorkType[] = []
  if (Array.isArray(source.workTypes)) {
    for (const raw of source.workTypes) {
      const item = raw as Partial<WorkType> | null
      const name = String(item?.name ?? '').trim()
      const price = Number(item?.price)
      if (
        name &&
        Number.isFinite(price) &&
        price >= 0 &&
        !workTypes.some((type) => type.name === name)
      ) {
        workTypes.push({ name, price: Math.round(price * 100) / 100 })
      }
    }
  }

  const recordMap = new Map<string, WorkRecord>()

  const mergeItem = (record: WorkRecord, item: Partial<WorkCount> | null) => {
    const workTypeName = String(item?.workTypeName ?? '').trim()
    const action = item?.action
    const counts = Number(item?.counts)
    if (
      !workTypeName ||
      (action !== '领取' && action !== '回收') ||
      !Number.isInteger(counts) ||
      counts <= 0
    ) {
      return
    }

    const existing = record.items.find(
      (current) => current.workTypeName === workTypeName && current.action === action,
    )
    if (existing) {
      existing.counts += counts
    } else {
      record.items.push({ workTypeName, action, counts })
    }
  }

  if (Array.isArray(source.workRecords)) {
    for (const raw of source.workRecords) {
      const record = raw as Partial<WorkRecord> & Partial<WorkCount>
      const personName = String(record?.personName ?? '').trim()
      const date = String(record?.date ?? '').trim()
      if (!personName || !DATE_PATTERN.test(date)) continue

      const key = `${personName}\u0000${date}`
      let target = recordMap.get(key)
      if (!target) {
        target = { personName, date, items: [] }
        recordMap.set(key, target)
      }

      if (record && Array.isArray(record.items)) {
        record.items.forEach((item) => mergeItem(target, item))
      } else if (record?.workTypeName) {
        mergeItem(target, record)
      }
    }
  }

  return {
    persons,
    workTypes,
    workRecords: [...recordMap.values()].filter((record) => record.items.length > 0),
  }
}

function normalizeName(value: string, label: string): string {
  const name = String(value ?? '').trim()
  if (!name) throw new Error(`${label}不能为空`)
  return name
}

function normalizePrice(value: number): number {
  const price = Number(value)
  if (!Number.isFinite(price) || price < 0) {
    throw new Error('价格必须是不小于 0 的数字')
  }
  return Math.round(price * 100) / 100
}

function normalizeDate(value: string): string {
  const text = String(value ?? '').trim()
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (!matched) throw new Error('日期格式必须为 YYYY-MM-DD')

  const [year, month, day] = matched.slice(1).map(Number)
  const date = new Date(`${text}T00:00:00`)
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    throw new Error(`日期「${text}」无效`)
  }
  return text
}

export function addPerson(data: AppData, rawName: string): AppData {
  const name = normalizeName(rawName, '姓名')
  if (data.persons.some((person) => person.name === name)) {
    throw new Error(`人员「${name}」已存在`)
  }
  return { ...data, persons: [...data.persons, { name }] }
}

export function removePerson(data: AppData, rawName: string): AppData {
  const name = normalizeName(rawName, '姓名')
  if (!data.persons.some((person) => person.name === name)) {
    throw new Error(`人员「${name}」不存在`)
  }
  if (data.workRecords.some((record) => record.personName === name)) {
    throw new Error(`人员「${name}」已有工作记录，无法删除`)
  }
  return { ...data, persons: data.persons.filter((person) => person.name !== name) }
}

export function saveWorkType(data: AppData, input: WorkTypeInput): AppData {
  const name = normalizeName(input.name, '工作类型名称')
  const price = normalizePrice(input.price)
  const originalName = String(input.originalName ?? '').trim()

  if (originalName && originalName !== name) {
    if (!data.workTypes.some((type) => type.name === originalName)) {
      throw new Error(`工作类型「${originalName}」不存在`)
    }
    if (data.workTypes.some((type) => type.name === name)) {
      throw new Error(`工作类型「${name}」已存在`)
    }
    return {
      ...data,
      workTypes: data.workTypes.map((type) =>
        type.name === originalName ? { name, price } : type,
      ),
      workRecords: data.workRecords.map((record) => ({
        ...record,
        items: record.items.map((item) =>
          item.workTypeName === originalName ? { ...item, workTypeName: name } : item,
        ),
      })),
    }
  }

  const exists = data.workTypes.some((type) => type.name === name)
  return {
    ...data,
    workTypes: exists
      ? data.workTypes.map((type) => (type.name === name ? { name, price } : type))
      : [...data.workTypes, { name, price }],
  }
}

export function removeWorkType(data: AppData, rawName: string): AppData {
  const name = normalizeName(rawName, '工作类型名称')
  if (!data.workTypes.some((type) => type.name === name)) {
    throw new Error(`工作类型「${name}」不存在`)
  }
  if (data.workRecords.some((record) => record.items.some((item) => item.workTypeName === name))) {
    throw new Error(`工作类型「${name}」已被工作记录使用，无法删除`)
  }
  return { ...data, workTypes: data.workTypes.filter((type) => type.name !== name) }
}

export function addWorkCount(data: AppData, input: WorkCountInput): AppData {
  const personName = normalizeName(input.personName, '姓名')
  const workTypeName = normalizeName(input.workTypeName, '工作类型名称')

  if (!data.persons.some((person) => person.name === personName)) {
    throw new Error(`人员「${personName}」不存在，请先添加人员`)
  }
  if (!data.workTypes.some((type) => type.name === workTypeName)) {
    throw new Error(`工作类型「${workTypeName}」不存在，请先添加工作类型`)
  }

  const date = normalizeDate(input.date)
  const counts = Number(input.counts)
  if (!Number.isInteger(counts) || counts <= 0) {
    throw new Error('数量必须是大于 0 的整数')
  }
  if (input.action !== '领取' && input.action !== '回收') {
    throw new Error('动作只能是「领取」或「回收」')
  }

  const recordIndex = data.workRecords.findIndex(
    (record) => record.personName === personName && record.date === date,
  )

  if (recordIndex === -1) {
    const record: WorkRecord = {
      personName,
      date,
      items: [{ workTypeName, action: input.action, counts }],
    }
    return { ...data, workRecords: [...data.workRecords, record] }
  }

  const record = data.workRecords[recordIndex]
  const itemIndex = record.items.findIndex(
    (item) => item.workTypeName === workTypeName && item.action === input.action,
  )
  const items =
    itemIndex === -1
      ? [...record.items, { workTypeName, action: input.action, counts }]
      : record.items.map((item, index) =>
          index === itemIndex ? { ...item, counts: item.counts + counts } : item,
        )

  return {
    ...data,
    workRecords: data.workRecords.map((current, index) =>
      index === recordIndex ? { ...current, items } : current,
    ),
  }
}

export function removeWorkCount(data: AppData, key: WorkCountKey): AppData {
  const personName = normalizeName(key.personName, '姓名')
  const workTypeName = normalizeName(key.workTypeName, '工作类型名称')
  const date = normalizeDate(key.date)

  const record = data.workRecords.find(
    (current) => current.personName === personName && current.date === date,
  )
  if (!record) throw new Error('工作记录不存在或已被删除')

  const items = record.items.filter(
    (item) => !(item.workTypeName === workTypeName && item.action === key.action),
  )
  if (items.length === record.items.length) {
    throw new Error('工作明细不存在或已被删除')
  }

  // 明细全部删除后，整条「人 + 日期」记录也一并移除
  if (items.length === 0) {
    return {
      ...data,
      workRecords: data.workRecords.filter(
        (current) => !(current.personName === personName && current.date === date),
      ),
    }
  }

  return {
    ...data,
    workRecords: data.workRecords.map((current) =>
      current.personName === personName && current.date === date ? { ...current, items } : current,
    ),
  }
}
