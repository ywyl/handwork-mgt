import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { WorkBook } from 'xlsx'
import type { PersonWorkInfo } from '@/views/interface'
import {
  collectColumns,
  exportRows,
  readWorkbook,
  sheetToGrid,
  sheetToRows,
  type GridOptions,
  type SheetGrid,
  type SheetRow,
} from '@/utils/excel'

export const useRecordsStore = defineStore('records', () => {
  const fileName = ref('')
  const sheetNames = ref<string[]>([])
  const activeSheet = ref('')
  const rows = ref<SheetRow[]>([])
  // 工作簿对象体积大且无需深度响应式
  const workbook = shallowRef<WorkBook | null>(null)

  const columns = computed(() => collectColumns(rows.value))

  const personData = ref<SheetGrid>([])

  function formatMonthDay(value: unknown): string {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return `${String(value.getMonth() + 1).padStart(2, '0')}.${String(value.getDate()).padStart(2, '0')}`
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 24 * 60 * 60 * 1000)
      return `${String(date.getUTCMonth() + 1).padStart(2, '0')}.${String(date.getUTCDate()).padStart(2, '0')}`
    }

    const text = String(value ?? '').trim()
    const fullDate = text.match(/^\d{4}[-/](\d{1,2})[-/](\d{1,2})/)
    if (fullDate) {
      return `${fullDate[1].padStart(2, '0')}.${fullDate[2].padStart(2, '0')}`
    }

    const monthDay = text.match(/^(\d{1,2})[./](\d{1,2})$/)
    if (monthDay) {
      return `${monthDay[1].padStart(2, '0')}.${monthDay[2].padStart(2, '0')}`
    }

    return text
  }

  function loadSheet(name: string) {
    const sheet = workbook.value?.Sheets[name]
    if (!sheet) return
    activeSheet.value = name
    rows.value = sheetToRows(sheet)
    personData.value = getSheetGrid()
    console.log('personnel mounted, employees:', personData)
  }

  async function loadFile(file: File) {
    const parsed = await readWorkbook(file)
    if (parsed.SheetNames.length === 0) {
      throw new Error('该文件不包含任何工作表')
    }
    fileName.value = file.name
    workbook.value = parsed
    sheetNames.value = [...parsed.SheetNames]
    loadSheet(sheetNames.value[0])
  }

  /** 取指定工作表（默认当前表）的二维数组；表不存在时返回空数组 */
  function getSheetGrid(
    name = activeSheet.value || sheetNames.value[0] || '',
    options?: GridOptions,
  ): SheetGrid {
    const sheet = name ? workbook.value?.Sheets[name] : undefined
    return sheet ? sheetToGrid(sheet, options) : []
  }

  function setCell(row: SheetRow, column: string, value: string) {
    row[column] = value
  }

  function addRow() {
    const row: SheetRow = {}
    columns.value.forEach((column) => {
      row[column] = ''
    })
    rows.value.push(row)
  }

  function removeRow(index: number) {
    rows.value.splice(index, 1)
  }

  function addWorkRecord(work: PersonWorkInfo) {
    if (!activeSheet.value || !rows.value.length) {
      throw new Error('请先在首页导入包含表头的 Excel 工作表')
    }

    const nameColumn = columns.value.includes('名称')
      ? '名称'
      : columns.value.includes('姓名')
        ? '姓名'
        : undefined
    if (!nameColumn || !columns.value.includes('日期')) {
      throw new Error('当前工作表必须包含“名称”或“姓名”列，以及“日期”列')
    }

    const targetColumn = `${work.taskName}${work.action}`
    if (!columns.value.includes(targetColumn)) {
      throw new Error(`当前工作表中找不到“${targetColumn}”列`)
    }

    const name = work.personName.name.trim()
    const date = formatMonthDay(work.date)
    const existingRow = rows.value.find(
      (row) =>
        String(row[nameColumn] ?? '').trim() === name && formatMonthDay(row['日期']) === date,
    )

    if (existingRow) {
      const currentValue = existingRow[targetColumn]
      const currentCount =
        currentValue === null || currentValue === undefined || currentValue === ''
          ? 0
          : Number(currentValue)
      if (!Number.isFinite(currentCount)) {
        throw new Error(`“${targetColumn}”列已有非数字内容，无法累加数量`)
      }

      columns.value.forEach((column) => {
        const value = existingRow[column]
        if (
          column !== nameColumn &&
          column !== '日期' &&
          (value === '' || value === null || value === undefined)
        ) {
          existingRow[column] = 0
        }
      })
      existingRow['日期'] = date
      existingRow[targetColumn] = currentCount + work.counts
      return
    }

    const newRow: SheetRow = Object.fromEntries(columns.value.map((column) => [column, 0]))
    newRow[nameColumn] = name
    newRow['日期'] = date
    newRow[targetColumn] = work.counts
    rows.value.push(newRow)
  }

  function clear() {
    fileName.value = ''
    sheetNames.value = []
    activeSheet.value = ''
    rows.value = []
    workbook.value = null
  }

  function exportCurrent() {
    const base = fileName.value.replace(/\.(xlsx|xls|csv)$/i, '') || 'handwork'
    exportRows(rows.value, activeSheet.value || 'Sheet1', `${base}-导出.xlsx`)
  }

  return {
    fileName,
    sheetNames,
    activeSheet,
    rows,
    columns,
    personData,
    loadSheet,
    loadFile,
    getSheetGrid,
    setCell,
    addRow,
    removeRow,
    addWorkRecord,
    clear,
    exportCurrent,
  }
})
