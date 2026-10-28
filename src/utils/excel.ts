import * as XLSX from 'xlsx'

export type CellValue = string | number | boolean | null
export type SheetRow = Record<string, CellValue>

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** 读取浏览器 File/Blob 为工作簿（支持 xlsx / xls / csv 等 SheetJS 可解析格式） */
export async function readWorkbook(file: Blob): Promise<XLSX.WorkBook> {
  const buffer = await file.arrayBuffer()
  return XLSX.read(buffer, { type: 'array' })
}

/** 工作表 → 行对象数组，首行作为表头；空单元格补空字符串 */
export function sheetToRows(sheet: XLSX.WorkSheet): SheetRow[] {
  return XLSX.utils.sheet_to_json<SheetRow>(sheet, { defval: '', raw: true })
}

/** 收集所有行出现过的列名（保持首次出现顺序） */
export function collectColumns(rows: readonly SheetRow[]): string[] {
  const columns = new Set<string>()
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => columns.add(key))
  })
  return [...columns]
}

export function rowsToSheet(rows: readonly SheetRow[]): XLSX.WorkSheet {
  return XLSX.utils.json_to_sheet(
    rows.map((row) => ({ ...row })),
    {
      header: collectColumns(rows),
    },
  )
}

/** 由行数据生成 xlsx 并通过浏览器下载（Electron 下会弹出系统保存对话框） */
export function exportRows(rows: readonly SheetRow[], sheetName: string, fileName: string): void {
  const workbook = XLSX.utils.book_new()
  // Excel 工作表名长度上限 31 且不能包含 : \ / ? * [ ]
  const safeName = sheetName.replace(/[:\\/?*[\]]/g, '_').slice(0, 31) || 'Sheet1'
  XLSX.utils.book_append_sheet(workbook, rowsToSheet(rows), safeName)

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  const url = URL.createObjectURL(new Blob([buffer], { type: XLSX_MIME }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
