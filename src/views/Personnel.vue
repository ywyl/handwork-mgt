<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

interface Employee {
  id: string
  name: string
  gender: string
  department: string
  position: string
  joinDate: string
  status: '在职' | '休假'
}

const employees: Employee[] = [
  {
    id: 'HWM-001',
    name: '林晓雨',
    gender: '女',
    department: '生产部',
    position: '组长',
    joinDate: '2022-03-14',
    status: '在职',
  },
  {
    id: 'HWM-002',
    name: '陈志远',
    gender: '男',
    department: '仓储部',
    position: '仓库管理员',
    joinDate: '2021-08-02',
    status: '在职',
  },
  {
    id: 'HWM-003',
    name: '周静怡',
    gender: '女',
    department: '财务部',
    position: '会计',
    joinDate: '2023-01-09',
    status: '在职',
  },
  {
    id: 'HWM-004',
    name: '黄建明',
    gender: '男',
    department: '生产部',
    position: '技工',
    joinDate: '2020-11-16',
    status: '在职',
  },
  {
    id: 'HWM-005',
    name: '吴佳宁',
    gender: '女',
    department: '人事部',
    position: '人事专员',
    joinDate: '2024-04-22',
    status: '在职',
  },
  {
    id: 'HWM-006',
    name: '郑文博',
    gender: '男',
    department: '采购部',
    position: '采购专员',
    joinDate: '2022-07-11',
    status: '休假',
  },
  {
    id: 'HWM-007',
    name: '王美玲',
    gender: '女',
    department: '生产部',
    position: '质检员',
    joinDate: '2023-06-05',
    status: '在职',
  },
  {
    id: 'HWM-008',
    name: '刘海峰',
    gender: '男',
    department: '物流部',
    position: '配送员',
    joinDate: '2021-12-01',
    status: '在职',
  },
  {
    id: 'HWM-009',
    name: '张思涵',
    gender: '女',
    department: '销售部',
    position: '销售专员',
    joinDate: '2024-02-19',
    status: '在职',
  },
  {
    id: 'HWM-010',
    name: '杨国强',
    gender: '男',
    department: '设备部',
    position: '维修技师',
    joinDate: '2019-09-23',
    status: '在职',
  },
  {
    id: 'HWM-011',
    name: '赵雨桐',
    gender: '女',
    department: '生产部',
    position: '技工',
    joinDate: '2022-10-17',
    status: '在职',
  },
  {
    id: 'HWM-012',
    name: '孙浩然',
    gender: '男',
    department: '仓储部',
    position: '叉车司机',
    joinDate: '2023-08-28',
    status: '休假',
  },
  {
    id: 'HWM-013',
    name: '徐梦洁',
    gender: '女',
    department: '行政部',
    position: '行政专员',
    joinDate: '2021-05-10',
    status: '在职',
  },
  {
    id: 'HWM-014',
    name: '马凯',
    gender: '男',
    department: '生产部',
    position: '班组长',
    joinDate: '2020-02-03',
    status: '在职',
  },
  {
    id: 'HWM-015',
    name: '郭若兰',
    gender: '女',
    department: '采购部',
    position: '采购主管',
    joinDate: '2018-12-12',
    status: '在职',
  },
]

const keyword = ref('')
const currentPage = ref(1)
const pageSize = 10

const filteredEmployees = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase()
  if (!query) return employees

  return employees.filter((employee) =>
    Object.values(employee).some((value) => value.toLocaleLowerCase().includes(query)),
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
            placeholder="搜索姓名、工号、部门或岗位"
            clearable
            :prefix-icon="Search"
          />
        </div>
      </template>

      <el-table :data="pageEmployees" stripe>
        <el-table-column prop="id" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="department" label="部门" min-width="120" />
        <el-table-column prop="position" label="岗位" min-width="120" />
        <el-table-column prop="joinDate" label="入职日期" min-width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }: { row: Employee }">
            <el-tag :type="row.status === '在职' ? 'success' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
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
