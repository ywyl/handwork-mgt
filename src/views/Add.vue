<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAdditionsStore } from '@/stores/additions'
import type { PersonInfo, TaskInfo } from './interface'

const store = useAdditionsStore()

// 数字输入框可能被清空，表单模型允许 undefined，提交时再兜底
interface TaskForm {
  name: string
  price?: number
}

interface WorkForm {
  personName: string
  taskName: string
  counts?: number
  date: string
}

const personFormRef = ref<FormInstance>()
const personForm = reactive<PersonInfo>({ name: '', age: undefined })
const personRules: FormRules<PersonInfo> = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
}

const taskFormRef = ref<FormInstance>()
const taskForm = reactive<TaskForm>({ name: '', price: 0 })
const taskRules: FormRules<TaskForm> = {
  name: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
}

const workFormRef = ref<FormInstance>()
const workForm = reactive<WorkForm>({ personName: '', taskName: '', counts: 1, date: '' })
const workRules: FormRules<WorkForm> = {
  personName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  date: [{ required: true, message: '请选择工作日期', trigger: 'change' }],
}

async function validate(formRef: FormInstance | undefined): Promise<boolean> {
  if (!formRef) return false
  return formRef.validate().catch(() => false)
}

async function submitPerson() {
  if (!(await validate(personFormRef.value))) return
  store.addPerson({ name: personForm.name.trim(), age: personForm.age })
  personForm.name = ''
  personForm.age = undefined
  personFormRef.value?.clearValidate()
  ElMessage.success('已添加一条人员信息')
}

async function submitTask() {
  if (!(await validate(taskFormRef.value))) return
  store.addTask({ name: taskForm.name.trim(), price: taskForm.price ?? 0 })
  taskForm.name = ''
  taskForm.price = 0
  taskFormRef.value?.clearValidate()
  ElMessage.success('已添加一条物品信息')
}

async function submitWork() {
  if (!(await validate(workFormRef.value))) return
  store.addWork({
    personName: { name: workForm.personName.trim() },
    taskName: { name: workForm.taskName.trim() },
    counts: workForm.counts ?? 0,
    date: workForm.date,
  })
  workForm.personName = ''
  workForm.taskName = ''
  workForm.counts = 1
  workForm.date = ''
  workFormRef.value?.clearValidate()
  ElMessage.success('已添加一条工作信息')
}
</script>

<template>
  <div class="add">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>第一部分 · 添加人员</span>
          <span class="count">已添加 {{ store.persons.length }} 条</span>
        </div>
      </template>

      <el-form ref="personFormRef" :model="personForm" :rules="personRules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="personForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number
            v-model="personForm.age"
            :min="1"
            :max="150"
            controls-position="right"
            placeholder="可选，1 - 150"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitPerson">添加人员</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="store.persons" size="small" border max-height="220">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column label="年龄" width="90">
          <template #default="{ row }: { row: PersonInfo }">{{ row.age ?? '-' }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>第二部分 · 添加物品</span>
          <span class="count">已添加 {{ store.tasks.length }} 条</span>
        </div>
      </template>

      <el-form ref="taskFormRef" :model="taskForm" :rules="taskRules" label-width="80px">
        <el-form-item label="物品名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入物品名称" clearable />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="taskForm.price"
            :min="0"
            :precision="2"
            :step="1"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitTask">添加物品</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="store.tasks" size="small" border max-height="220">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="name" label="物品名称" min-width="120" />
        <el-table-column label="价格" width="120">
          <template #default="{ row }: { row: TaskInfo }"> ¥{{ row.price.toFixed(2) }} </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>第三部分 · 添加工作信息</span>
          <span class="count">已添加 {{ store.works.length }} 条</span>
        </div>
      </template>

      <el-form ref="workFormRef" :model="workForm" :rules="workRules" label-width="80px">
        <el-form-item label="姓名" prop="personName">
          <el-input v-model="workForm.personName" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="workForm.taskName" placeholder="请输入任务名称" clearable />
        </el-form-item>
        <el-form-item label="数量" prop="counts">
          <el-input-number
            v-model="workForm.counts"
            :min="1"
            :step="1"
            :precision="0"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="workForm.date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择工作日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitWork">添加工作信息</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="store.works" size="small" border max-height="220">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="personName.name" label="姓名" min-width="100" />
        <el-table-column prop="taskName.name" label="任务名称" min-width="120" />
        <el-table-column prop="counts" label="数量" width="90" />
        <el-table-column prop="date" label="日期" min-width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.add {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1100px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .count {
    font-size: 12px;
    color: #909399;
  }
}
</style>
