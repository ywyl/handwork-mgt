import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Electron：主进程 + 预加载脚本（开发时自动启动 / 热重启 Electron）
    electron({
      main: {
        // Shortcut of `build.lib.entry`
        entry: 'electron/main.ts',
      },
      preload: {
        // Shortcut of `build.rolldownOptions.input`
        input: 'electron/preload.ts',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 打包后通过 file:// 协议加载，需使用相对路径
  base: './',
  css: {
    preprocessorOptions: {
      scss: {
        // 让所有 SCSS 块自动获得全局变量
        additionalData: `@use "@/styles/variables" as *;`,
      },
    },
  },
})
