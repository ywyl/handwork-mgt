<script setup lang="ts">
const techStack = [
  { name: 'Electron', description: '跨平台桌面应用框架' },
  { name: 'Vue 3', description: '渐进式 JavaScript 框架' },
  { name: 'TypeScript', description: '类型安全的 JavaScript 超集' },
  { name: 'electron-store', description: '主进程本地数据持久化' },
  { name: 'Element Plus', description: '基于 Vue 3 的组件库' },
  { name: 'Pinia', description: 'Vue 状态管理' },
  { name: 'Vue Router', description: 'Vue 官方路由' },
  { name: 'Vite', description: '下一代前端构建工具' },
  { name: 'Sass', description: 'CSS 预处理器' },
]

// preload 通过 contextBridge 暴露的桌面环境信息（网页环境为 undefined）
const electronInfo = window.electronAPI
</script>

<template>
  <div class="about">
    <el-card>
      <template #header>
        <h2>关于项目</h2>
      </template>
      <p>
        这是一个基于 Electron + Vue 3 + electron-store 的桌面工作记录管理项目，使用以下技术栈搭建：
      </p>
      <el-table :data="techStack" stripe style="width: 100%">
        <el-table-column prop="name" label="技术" width="150" />
        <el-table-column prop="description" label="说明" />
      </el-table>

      <el-divider />

      <template v-if="electronInfo">
        <el-descriptions title="运行环境" :column="2" border>
          <el-descriptions-item label="操作系统">
            <el-tag size="small">{{ electronInfo.platform }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Electron">
            {{ electronInfo.versions.electron }}
          </el-descriptions-item>
          <el-descriptions-item label="Chromium">
            {{ electronInfo.versions.chrome }}
          </el-descriptions-item>
          <el-descriptions-item label="Node.js">
            {{ electronInfo.versions.node }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.about {
  max-width: 600px;
  margin: 0 auto;
}
</style>
