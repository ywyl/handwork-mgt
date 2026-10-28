<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { PersonInfo } from './interface'

const employees: PersonInfo[] = [
  { name: '林晓雨', age: 34 },
  { name: '陈志远', age: 41 },
  { name: '周静怡', age: 29 },
  { name: '黄建明', age: 45 },
  { name: '吴佳宁', age: 26 },
  { name: '郑文博', age: 33 },
  { name: '王美玲', age: 31 },
  { name: '刘海峰', age: 38 },
  { name: '张思涵', age: 24 },
  { name: '杨国强', age: 52 },
  { name: '赵雨桐', age: 28 },
  { name: '孙浩然', age: 36 },
  { name: '徐梦洁', age: 30 },
  { name: '马凯', age: 43 },
  { name: '郭若兰', age: 47 },
]

const keyword = ref('')
const currentPage = ref(1)
const pageSize = 10

const filteredEmployees = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase()
  if (!query) return employees

  return employees.filter((employee) =>
    [employee.name, employee.age].some((value) =>
      String(value ?? '')
        .toLocaleLowerCase()
        .includes(query),
    ),
  )
})

const pageEmployees = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredEmployees.value.slice(start, start + pageSize)
})

watch(keyword, () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="personnel">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <h2>人员管理</h2>
            <p>共 {{ filteredEmployees.length }} 名人员</p>
          </div>
          <el-input
            v-model="keyword"
            class="search-input"
            placeholder="搜索姓名或年龄"
            clearable
            :prefix-icon="Search"
          />
        </div>
      </template>

      <el-table :data="pageEmployees" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column label="年龄" width="100">
          <template #default="{ row }: { row: PersonInfo }">
            {{ row.age ?? '-' }}
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="没有找到匹配的人员" />
        </template>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredEmployees.length"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.personnel {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  h2 {
    font-size: 18px;
    font-weight: 600;
  }

  p {
    margin-top: 6px;
    color: #909399;
    font-size: 13px;
  }

  .search-input {
    width: min(320px, 100%);
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 600px) {
  .pagination {
    justify-content: center;

    :deep(.el-pagination) {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
}
</style>
