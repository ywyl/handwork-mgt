<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useDataStore } from '@/stores/data'
import type { WorkAction, WorkCountInput, WorkType } from '@/views/interface'

const store = useDataStore()

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : '操作失败'
}

async function validate(formRef: FormInstance | undefined): Promise<boolean> {
  if (!formRef) return false
  return formRef.validate().catch(() => false)
}

async function confirmRemove(message: string): Promise<boolean> {
  try {
    await ElMessageBox.confirm(message, '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    return true
  } catch {
    return false
  }
}

/* 第一部分：人员（姓名唯一） */
const personFormRef = ref<FormInstance>()
const personForm = reactive({ name: '' })
const personRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
}

async function submitPerson() {
  if (!(await validate(personFormRef.value))) return
  try {
    await store.addPerson(personForm.name)
    personForm.name = ''
    personFormRef.value?.clearValidate()
    ElMessage.success('已添加人员')
  } catch (error) {
    ElMessage.error(toMessage(error))
  }
}

async function removePerson(name: string) {
  if (!(await confirmRemove(`确定删除人员「${name}」吗？`))) return
  try {
    await store.removePerson(name)
    ElMessage.success('已删除人员')
  } catch (error) {
    ElMessage.error(toMessage(error))
  }
}

/* 第二部分：工作类型（名称 + 单价） */
const workTypeFormRef = ref<FormInstance>()
const workTypeForm = reactive<{ name: string; price: number | undefined }>({ name: '', price: 1 })
const editingWorkType = ref('')
const workTypeRules: FormRules = {
  name: [{ required: true, message: '请输入工作类型名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'change' }],
}

function editWorkType(type: WorkType) {
  editingWorkType.value = type.name
  workTypeForm.name = type.name
  workTypeForm.price = type.price
}

function resetWorkTypeForm() {
  editingWorkType.value = ''
  workTypeForm.name = ''
  workTypeForm.price = 1
  workTypeFormRef.value?.clearValidate()
}

async function submitWorkType() {
  if (!(await validate(workTypeFormRef.value))) return
  try {
    await store.saveWorkType({
      name: workTypeForm.name,
      price: workTypeForm.price ?? 0,
      originalName: editingWorkType.value || undefined,
    })
    ElMessage.success(editingWorkType.value ? '已更新工作类型' : '已添加工作类型')
    resetWorkTypeForm()
  } catch (error) {
    ElMessage.error(toMessage(error))
  }
}

async function removeWorkType(name: string) {
  if (!(await confirmRemove(`确定删除工作类型「${name}」吗？`))) return
  try {
    await store.removeWorkType(name)
    if (editingWorkType.value === name) resetWorkTypeForm()
    ElMessage.success('已删除工作类型')
  } catch (error) {
    ElMessage.error(toMessage(error))
  }
}

/* 第三部分：工作信息 */
interface WorkForm {
  personName: string
  workTypeName: string
  action: WorkAction
  counts: number | undefined
  date: string
}

const workFormRef = ref<FormInstance>()
const workForm = reactive<WorkForm>({
  personName: '',
  workTypeName: '',
  action: '领取',
  counts: 1,
  date: '',
})
const workRules: FormRules = {
  personName: [{ required: true, message: '请选择人员', trigger: 'change' }],
  workTypeName: [{ required: true, message: '请选择工作类型', trigger: 'change' }],
  action: [{ required: true, message: '请选择领取或回收', trigger: 'change' }],
  counts: [{ required: true, message: '请输入数量', trigger: 'change' }],
  date: [{ required: true, message: '请选择工作日期', trigger: 'change' }],
}

async function submitWork() {
  if (!(await validate(workFormRef.value))) return
  try {
    await store.addWorkCount({
      personName: workForm.personName,
      workTypeName: workForm.workTypeName,
      action: workForm.action,
      counts: workForm.counts ?? 0,
      date: workForm.date,
    })
    workForm.counts = 1
    workFormRef.value?.clearValidate()
    ElMessage.success('已添加工作信息')
  } catch (error) {
    ElMessage.error(toMessage(error))
  }
}

async function removeRecord(row: WorkCountInput) {
  const message = `确定删除 ${row.personName} 在 ${row.date} 的「${row.workTypeName}·${row.action}」明细吗？`
  if (!(await confirmRemove(message))) return
  try {
    await store.removeWorkCount({
      personName: row.personName,
      date: row.date,
      workTypeName: row.workTypeName,
      action: row.action,
    })
    ElMessage.success('已删除工作明细')
  } catch (error) {
    ElMessage.error(toMessage(error))
  }
}
</script>

<template>
  <div class="add">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>第一部分 · 人员</span>
          <span class="count">共 {{ store.persons.length }} 人</span>
        </div>
      </template>

      <el-form ref="personFormRef" :model="personForm" :rules="personRules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="personForm.name" placeholder="请输入姓名（不可重复）" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitPerson">添加人员</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="store.persons" size="small" border max-height="220">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column label="操作" width="90">
          <template #default="{ row }: { row: { name: string } }">
            <el-button link type="danger" @click="removePerson(row.name)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ editingWorkType ? '编辑工作类型' : '第二部分 · 工作类型' }}</span>
          <span class="count">共 {{ store.workTypes.length }} 种</span>
        </div>
      </template>

      <el-form
        ref="workTypeFormRef"
        :model="workTypeForm"
        :rules="workTypeRules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="workTypeForm.name" placeholder="请输入工作类型名称" clearable />
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input-number
            v-model="workTypeForm.price"
            :min="0"
            :step="0.1"
            :precision="2"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitWorkType">
            {{ editingWorkType ? '保存修改' : '添加工作类型' }}
          </el-button>
          <el-button v-if="editingWorkType" @click="resetWorkTypeForm">取消编辑</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="store.workTypes" size="small" border max-height="220">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="price" label="单价（元）" width="110" />
        <el-table-column label="操作" width="130">
          <template #default="{ row }: { row: WorkType }">
            <el-button link type="primary" @click="editWorkType(row)">编辑</el-button>
            <el-button link type="danger" @click="removeWorkType(row.name)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>第三部分 · 工作信息</span>
          <span class="count">
            共 {{ store.workRecords.length }} 条记录 · {{ store.countRows.length }} 条明细
          </span>
        </div>
      </template>

      <el-form ref="workFormRef" :model="workForm" :rules="workRules" label-width="80px">
        <el-form-item label="姓名" prop="personName">
          <el-select v-model="workForm.personName" filterable placeholder="请选择人员">
            <el-option v-for="name in store.personNames" :key="name" :label="name" :value="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作类型" prop="workTypeName">
          <el-select v-model="workForm.workTypeName" filterable placeholder="请选择工作类型">
            <el-option
              v-for="type in store.workTypes"
              :key="type.name"
              :label="`${type.name}（${type.price} 元）`"
              :value="type.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="领取/回收" prop="action">
          <el-select v-model="workForm.action" placeholder="请选择领取或回收">
            <el-option label="领取" value="领取" />
            <el-option label="回收" value="回收" />
          </el-select>
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
          <span v-if="!store.persons.length || !store.workTypes.length" class="hint">
            需要先添加人员和工作类型
          </span>
        </el-form-item>
      </el-form>

      <el-table :data="store.countRows" size="small" border max-height="300">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="personName" label="姓名" min-width="100" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="workTypeName" label="工作类型" min-width="110" />
        <el-table-column prop="action" label="领取/回收" width="100" />
        <el-table-column prop="counts" label="数量" width="80" />
        <el-table-column label="金额（元）" width="110">
          <template #default="{ row }: { row: WorkCountInput }">{{ store.amountOf(row) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90">
          <template #default="{ row }: { row: WorkCountInput }">
            <el-button link type="danger" @click="removeRecord(row)">删除</el-button>
          </template>
        </el-table-column>
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

.hint {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}
</style>
