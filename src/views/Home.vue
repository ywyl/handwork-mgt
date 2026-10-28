<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, type UploadFile } from 'element-plus'
import { Delete, Download, Plus, Upload } from '@element-plus/icons-vue'
import { useRecordsStore } from '@/stores/records'

const store = useRecordsStore()
const loading = ref(false)

const summary = computed(() => [
  { label: '文件', value: store.fileName || '-' },
  { label: '工作表', value: store.activeSheet || '-' },
  { label: '行数', value: String(store.rows.length) },
  { label: '列数', value: String(store.columns.length) },
])

function formatCell(value: unknown): string {
  return value === null || value === undefined ? '' : String(value)
}

async function handleFileChange(uploadFile: UploadFile) {
  if (!uploadFile.raw) return
  loading.value = true
  try {
    await store.loadFile(uploadFile.raw)
    ElMessage.success(`已导入「${uploadFile.name}」，共 ${store.rows.length} 行`)
  } catch (error) {
    ElMessage.error(error instanceof Error ? `解析失败：${error.message}` : '文件解析失败')
  } finally {
    loading.value = false
  }
}

function handleExport() {
  if (store.rows.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  store.exportCurrent()
  ElMessage.success('已生成 Excel 文件')
}
</script>

<template>
  <div class="home">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>Excel 数据</span>
          <div class="actions">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              accept=".xlsx,.xls,.csv"
              :on-change="handleFileChange"
            >
              <el-button type="primary" :icon="Upload" :loading="loading">
                选择 Excel 文件
              </el-button>
            </el-upload>
            <el-select
              v-if="store.sheetNames.length"
              :model-value="store.activeSheet"
              class="sheet-select"
              placeholder="选择工作表"
              @update:model-value="(name: string) => store.loadSheet(name)"
            >
              <el-option v-for="name in store.sheetNames" :key="name" :label="name" :value="name" />
            </el-select>
            <el-button type="success" :icon="Download" @click="handleExport">导出 Excel</el-button>
            <el-button :icon="Delete" :disabled="store.rows.length === 0" @click="store.clear()">
              清空
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="4" border size="small">
        <el-descriptions-item v-for="item in summary" :key="item.label" :label="item.label">
          {{ item.value }}
        </el-descriptions-item>
      </el-descriptions>

      <template v-if="store.rows.length">
        <div class="table-toolbar">
          <el-button size="small" :icon="Plus" @click="store.addRow()">新增行</el-button>
          <span class="hint">单元格可直接编辑，修改后可导出新的 Excel 文件</span>
        </div>
        <el-table :data="store.rows" border height="440" size="small">
          <el-table-column type="index" label="#" width="56" fixed />
          <el-table-column
            v-for="column in store.columns"
            :key="column"
            :label="column"
            min-width="160"
          >
            <template #default="{ row }">
              <el-input
                :model-value="formatCell(row[column])"
                size="small"
                @update:model-value="(value: string) => store.setCell(row, column, value)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ $index }">
              <el-button link type="danger" @click="store.removeRow($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <el-empty v-else description="选择一个 .xlsx / .xls / .csv 文件开始" />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.home {
  max-width: 1100px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .sheet-select {
    width: 160px;
  }
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0 12px;

  .hint {
    font-size: 12px;
    color: #909399;
  }
}
</style>
