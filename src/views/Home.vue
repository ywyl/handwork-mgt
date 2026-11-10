<script setup lang="ts">
import { computed } from 'vue'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()

const overview = computed(() => [
  { label: '人员', value: `${dataStore.persons.length} 人` },
  { label: '工作类型', value: `${dataStore.workTypes.length} 种` },
  { label: '记录（人·日）', value: `${dataStore.workRecords.length} 条` },
  { label: '工作明细', value: `${dataStore.countRows.length} 条` },
  { label: '累计数量', value: `${dataStore.totalCounts} 件` },
  { label: '金额合计', value: `${dataStore.totalAmount} 元` },
])
</script>

<template>
  <div class="home">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>本地数据总览</span>
          <span class="hint">数据保存在 electron-store 中，按记录数量 × 单价合计金额</span>
        </div>
      </template>

      <el-descriptions :column="3" border size="small">
        <el-descriptions-item v-for="item in overview" :key="item.label" :label="item.label">
          {{ item.value }}
        </el-descriptions-item>
      </el-descriptions>

      <el-table
        v-if="dataStore.personSummaries.length"
        :data="dataStore.personSummaries"
        class="summary-table"
        size="small"
        border
        max-height="440"
      >
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="recordCount" label="记录数（人·日）" width="140" />
        <el-table-column prop="counts" label="累计数量" width="110" />
        <el-table-column prop="amount" label="金额（元）" width="110" />
      </el-table>
      <el-empty v-else :image-size="60" description="暂无本地数据，可在「添加」页录入" />
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

  .hint {
    font-size: 12px;
    color: #909399;
  }
}

.summary-table {
  margin-top: 12px;
}
</style>
