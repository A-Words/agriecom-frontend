// https://nuxt.com/docs/api/configuration/nuxt-config
const apiBaseUrl = (
  (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> }
  }).process?.env?.NUXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8080'
)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: {
      apiBaseUrl
    }
  }
})
