<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, InfoFilled, Plus, UserFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 最多显示多少个页签（固定页签也计入总数）
const MAX_TABS = 8

// 路由 meta.icon 中填写的图标名称 → Element Plus 图标组件
const iconMap: Record<string, Component> = {
  HomeFilled,
  UserFilled,
  InfoFilled,
  Plus,
}

interface NavTab {
  path: string
  title: string
  icon?: Component
  affix: boolean
}

// 由路由表动态生成页签：仅展示配置了 meta.title 的路由，按 meta.order 排序
const allTabs = computed<NavTab[]>(() => {
  const routes = router
    .getRoutes()
    .filter((r) => r.meta?.title && !r.redirect)
    .sort((a, b) => Number(a.meta.order ?? 99) - Number(b.meta.order ?? 99))

  return routes.map((r) => ({
    path: r.path,
    title: r.meta.title as string,
    icon: r.meta.icon ? iconMap[r.meta.icon as string] : undefined,
    affix: r.meta.affix === true,
  }))
})

// 固定页签：首页 / 关于（始终显示，不参与隐藏）
const affixTabs = computed(() => allTabs.value.filter((t) => t.affix))

// 展示的页签：固定页签置前，其余按顺序补齐，总数不超过 MAX_TABS
const visibleTabs = computed(() => {
  const affix = affixTabs.value
  const rest = allTabs.value.filter((t) => !affix.includes(t))
  return [...affix, ...rest.slice(0, Math.max(0, MAX_TABS - affix.length))]
})

function handleSelect(path: string) {
  if (route.path !== path) {
    router.push(path)
  }
}
</script>

<template>
  <div id="app-container" class="app-layout">
    <aside class="app-sidebar">
      <div class="logo">Handwork Mgt</div>
      <!-- 左侧导航：由路由表生成（首页 / 关于固定不隐藏，后续新增路由自动追加，最多显示 MAX_TABS 个） -->
      <nav v-if="visibleTabs.length" class="view-tabs" aria-label="主导航">
        <div
          v-for="tab in visibleTabs"
          :key="tab.path"
          class="view-tab"
          :class="{ active: route.path === tab.path }"
          :aria-current="route.path === tab.path ? 'page' : undefined"
          role="button"
          tabindex="0"
          @click="handleSelect(tab.path)"
          @keydown.enter="handleSelect(tab.path)"
          @keydown.space.prevent="handleSelect(tab.path)"
        >
          <el-icon v-if="tab.icon" class="tab-icon"><component :is="tab.icon" /></el-icon>
          {{ tab.title }}
        </div>
      </nav>
    </aside>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  // 整体锁定在视口内，由内容区域自行滚动，页面高度不会随窗口缩放溢出
  height: 100vh;
  overflow: hidden;
}

.app-sidebar {
  display: flex;
  flex: 0 0 220px;
  flex-direction: column;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  padding: 24px 12px;

  .logo {
    padding: 0 12px 24px;
    font-size: 20px;
    font-weight: bold;
    color: #409eff;
    white-space: nowrap;
  }
}

.app-main {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: auto;
  background-color: #f5f7fa;
  padding: 24px;
}

.view-tabs {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .view-tab {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid transparent;
    border-radius: 6px;
    font-size: 14px;
    color: $text-color;
    cursor: pointer;
    transition: all 0.2s;

    .tab-icon {
      font-size: 16px;
    }

    &:hover {
      color: $primary-color;
      background: #ecf5ff;
    }

    &.active {
      color: $primary-color;
      background: #ecf5ff;
      border-color: #d9ecff;
      font-weight: 600;
    }
  }
}

@media (max-width: 600px) {
  .app-sidebar {
    flex-basis: 72px;
    padding: 20px 8px;

    .logo {
      overflow: hidden;
      padding: 0 4px 24px;
      font-size: 0;

      &::first-letter {
        font-size: 20px;
      }
    }
  }

  .view-tab {
    justify-content: center;
    font-size: 0 !important;
    padding: 12px 8px !important;

    .tab-icon {
      font-size: 18px !important;
    }
  }

  .app-main {
    padding: 16px;
  }
}
</style>
