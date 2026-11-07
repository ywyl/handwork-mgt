<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useRecordsStore } from '@/stores/records'
import type { PersonInfo } from './interface'

const store = useRecordsStore()

// 二维数组首行是表头，其余行取第一列作为姓名；同名只保留首次出现的一项
const employees = computed<PersonInfo[]>(() => {
  const seen = new Set<string>()
  return store.personData
    .slice(1)
    .map((row) => String(row[0] ?? '').trim())
    .filter((name) => {
      if (!name || seen.has(name)) return false
      seen.add(name)
      return true
    })
    .map((name) => ({ name }))
})

const keyword = ref('')
const selectedName = ref('')

// 首行是表头；第一列是姓名（已在标题中展示），表格里跳过
const detailColumns = computed(() => {
  const first = store.personData[0]
  if (!first) return []
  return first.slice(1).map((cell, index) => ({
    index: index + 1,
    title: String(cell ?? '').trim() || `第 ${index + 2} 列`,
  }))
})

// 选中人员的原始行：第一列（姓名）与选中项相同，含重复记录
const selectedRows = computed(() => {
  if (!selectedName.value) return []
  return store.personData
    .slice(1)
    .filter((row) => String(row[0] ?? '').trim() === selectedName.value)
})

const filteredEmployees = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase()
  if (!query) return employees.value

  return employees.value.filter((person) => person.name.toLocaleLowerCase().includes(query))
})

function formatCell(value: unknown): string {
  return value === null || value === undefined ? '' : String(value)
}

function selectPerson(name: string) {
  selectedName.value = name
}

onMounted(() => {
  console.log('personnel mounted, employees:', store.personData)
})
</script>

<template>
  <div class="personnel">
    <aside class="person-list">
      <el-input
        v-model="keyword"
        class="search-input"
        placeholder="搜索姓名"
        clearable
        :prefix-icon="Search"
      />
      <div class="list-scroll">
        <div
          v-for="person in filteredEmployees"
          :key="person.name"
          class="person-item"
          :class="{ active: person.name === selectedName }"
          role="button"
          tabindex="0"
          @click="selectPerson(person.name)"
          @keydown.enter="selectPerson(person.name)"
        >
          {{ person.name }}
        </div>
        <el-empty
          v-if="!filteredEmployees.length"
          :image-size="60"
          :description="employees.length ? '没有匹配的人员' : '暂无人员数据'"
        />
      </div>
      <p class="count">共 {{ filteredEmployees.length }} 人</p>
    </aside>

    <section class="detail-pane">
      <template v-if="selectedName">
        <div class="detail-header">
          <h3>{{ selectedName }}</h3>
          <span>共 {{ selectedRows.length }} 条记录</span>
        </div>
        <div class="table-wrap">
          <el-table :data="selectedRows" border stripe height="100%">
            <el-table-column type="index" label="#" width="56" fixed />
            <el-table-column
              v-for="column in detailColumns"
              :key="column.index"
              :label="column.title"
              min-width="120"
            >
              <template #default="{ row }">{{ formatCell(row[column.index]) }}</template>
            </el-table-column>
            <template #empty>
              <el-empty :image-size="60" description="暂无相关数据" />
            </template>
          </el-table>
        </div>
      </template>
      <el-empty v-else class="detail-empty" description="从左侧选择人员" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.personnel {
  display: flex;
  gap: 16px;
  // 撑满主区域内可视高度（.app-main 已按视口高度布局），列表在其中滚动
  height: 100%;
  min-height: 320px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.person-list {
  display: flex;
  // 宽度随窗口伸缩：窄屏时收窄到 160px，宽屏时最多 240px
  flex: 0 0 auto;
  flex-direction: column;
  gap: 12px;
  width: clamp(160px, 20%, 240px);
  min-width: 0;
  min-height: 0;
  padding: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;

  .count {
    color: #909399;
    font-size: 12px;
  }
}

.list-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-top: 1px solid #f0f0f0;
}

.person-item {
  padding: 8px 10px;
  border-radius: 4px;
  color: $text-color;
  font-size: 14px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover {
    color: $primary-color;
    background: $bg-color;
  }

  &:focus-visible {
    outline: 2px solid $primary-color;
    outline-offset: -2px;
  }

  &.active {
    color: $primary-color;
    background: #ecf5ff;
    font-weight: 600;
  }
}

.detail-pane {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;

  .detail-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 8px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      word-break: break-all;
    }

    span {
      color: #909399;
      font-size: 12px;
      white-space: nowrap;
    }
  }

  .detail-empty {
    margin: auto;
  }

  .table-wrap {
    flex: 1;
    min-height: 0;
  }
}

@media (max-width: 900px) {
  .personnel {
    flex-direction: column;
    height: auto;
  }

  .person-list {
    flex: 0 0 auto;
    width: auto;
    max-height: 35vh;
  }

  .detail-pane {
    flex: 0 0 auto;
    // 明确高度，表格 height="100%" 才能随窗口高度正确伸缩
    height: clamp(300px, 52vh, 560px);
  }
}
</style>
