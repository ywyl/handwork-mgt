/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Electron preload 通过 contextBridge 暴露的 API（可选，网页环境不存在）
interface Window {
  electronAPI?: {
    platform: string
    versions: {
      electron: string
      chrome: string
      node: string
    }
  }
}
