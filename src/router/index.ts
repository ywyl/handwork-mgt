import { createRouter, createWebHashHistory } from 'vue-router'

// Electron 打包后通过 file:// 协议加载页面，故使用 Hash 模式路由
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      // meta：title=页签名称；icon=App.vue 中图标映射名；affix=固定页签（不隐藏）；order=排序
      meta: { title: '首页', icon: 'HomeFilled', affix: true, order: 0 },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/About.vue'),
      meta: { title: '关于', icon: 'InfoFilled', affix: true, order: 2 },
    },
    {
      path: '/personnel',
      name: 'personnel',
      component: () => import('@/views/Personnel.vue'),
      meta: { title: '人员管理', icon: 'UserFilled', affix: true, order: 1 },
    },
  ],
})

export default router
