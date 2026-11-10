import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createDataApi } from '@/services/dataApi'
import type {
  AppData,
  DataApi,
  Person,
  WorkCount,
  WorkCountInput,
  WorkCountKey,
  WorkRecord,
  WorkType,
  WorkTypeInput,
} from '@/views/interface'

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export const useDataStore = defineStore('data', () => {
  const api: DataApi = createDataApi()

  const persons = ref<Person[]>([])
  const workTypes = ref<WorkType[]>([])
  const workRecords = ref<WorkRecord[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  const personNames = computed(() => persons.value.map((person) => person.name))
  const workTypeNames = computed(() => workTypes.value.map((type) => type.name))
  const priceMap = computed(() => new Map(workTypes.value.map((type) => [type.name, type.price])))

  /** 记录以「人名 + 日期」唯一，按日期倒序排列 */
  const records = computed(() =>
    [...workRecords.value].sort(
      (a, b) => b.date.localeCompare(a.date) || a.personName.localeCompare(b.personName),
    ),
  )

  /** 把嵌套的工作明细展开成表格行 */
  const countRows = computed(() =>
    records.value.flatMap((record) =>
      record.items.map((item) => ({
        personName: record.personName,
        date: record.date,
        ...item,
      })),
    ),
  )

  const totalCounts = computed(() =>
    workRecords.value.reduce(
      (sum, record) => sum + record.items.reduce((itemSum, item) => itemSum + item.counts, 0),
      0,
    ),
  )

  const totalAmount = computed(() =>
    roundMoney(
      workRecords.value.reduce(
        (sum, record) =>
          sum +
          record.items.reduce(
            (itemSum, item) => itemSum + item.counts * (priceMap.value.get(item.workTypeName) ?? 0),
            0,
          ),
        0,
      ),
    ),
  )

  const personSummaries = computed(() =>
    persons.value.map((person) => {
      const list = workRecords.value.filter((record) => record.personName === person.name)
      const counts = list.reduce(
        (sum, record) => sum + record.items.reduce((itemSum, item) => itemSum + item.counts, 0),
        0,
      )
      const amount = list.reduce(
        (sum, record) =>
          sum +
          record.items.reduce(
            (itemSum, item) => itemSum + item.counts * (priceMap.value.get(item.workTypeName) ?? 0),
            0,
          ),
        0,
      )
      return { name: person.name, recordCount: list.length, counts, amount: roundMoney(amount) }
    }),
  )

  function amountOf(count: WorkCount): number {
    return roundMoney(count.counts * (priceMap.value.get(count.workTypeName) ?? 0))
  }

  function recordsOf(personName: string): WorkRecord[] {
    return records.value.filter((record) => record.personName === personName)
  }

  function apply(data: AppData) {
    persons.value = data.persons
    workTypes.value = data.workTypes
    workRecords.value = data.workRecords
    loaded.value = true
  }

  async function refresh() {
    loading.value = true
    try {
      apply(await api.getAll())
    } finally {
      loading.value = false
    }
  }

  async function addPerson(name: string) {
    apply(await api.addPerson(name))
  }

  async function removePerson(name: string) {
    apply(await api.removePerson(name))
  }

  async function saveWorkType(input: WorkTypeInput) {
    apply(await api.saveWorkType(input))
  }

  async function removeWorkType(name: string) {
    apply(await api.removeWorkType(name))
  }

  async function addWorkCount(input: WorkCountInput) {
    apply(await api.addWorkCount(input))
  }

  async function removeWorkCount(key: WorkCountKey) {
    apply(await api.removeWorkCount(key))
  }

  return {
    persons,
    workTypes,
    workRecords,
    loaded,
    loading,
    personNames,
    workTypeNames,
    priceMap,
    records,
    countRows,
    totalCounts,
    totalAmount,
    personSummaries,
    amountOf,
    recordsOf,
    refresh,
    addPerson,
    removePerson,
    saveWorkType,
    removeWorkType,
    addWorkCount,
    removeWorkCount,
  }
})
