import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { WorkBook } from 'xlsx'
import { collectColumns, exportRows, readWorkbook, sheetToRows, type SheetRow } from '@/utils/excel'

export const useRecordsStore = defineStore('records', () => {
  const fileName = ref('')
  const sheetNames = ref<string[]>([])
  const activeSheet = ref('')
  const rows = ref<SheetRow[]>([])
  // 工作簿对象体积大且无需深度响应式
  const workbook = shallowRef<WorkBook | null>(null)

  const columns = computed(() => collectColumns(rows.value))

  function loadSheet(name: string) {
    const sheet = workbook.value?.Sheets[name]
    if (!sheet) return
    activeSheet.value = name
    rows.value = sheetToRows(sheet)
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
    loadSheet,
    loadFile,
    setCell,
    addRow,
    removeRow,
    clear,
    exportCurrent,
  }
})
