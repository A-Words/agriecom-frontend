// https://nuxt.com/docs/api/configuration/nuxt-config
const apiBaseUrl = (
  (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> }
  }).process?.env?.NUXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8080'
)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  modules: ['@pinia/nuxt', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBaseUrl
    }
  },
  app: {
    head: {
      title: '农优选 - 新鲜农产品直达餐桌',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '农优选是一个连接农户与消费者的农产品电商平台，提供新鲜、优质的农产品直供服务。' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})