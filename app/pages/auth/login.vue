<script setup lang="ts">
import { useSessionStore } from '~/stores/session'

const sessionStore = useSessionStore()
const toast = useToast()
const route = useRoute()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  if (!form.username || !form.password) {
    toast.add({ title: '请输入用户名和密码', color: 'warning' })
    return
  }

  try {
    loading.value = true
    await sessionStore.login({
      username: form.username,
      password: form.password
    })
    toast.add({ title: '登录成功', color: 'success' })

    // 跳转到来源页面或首页
    const redirect = route.query.redirect as string
    navigateTo(redirect || '/')
  } catch (err: any) {
    toast.add({ title: err.message || '登录失败', color: 'error' })
  } finally {
    loading.value = false
  }
}

// 已登录则跳转
onMounted(() => {
  if (sessionStore.isAuthenticated) {
    navigateTo('/')
  }
})

useSeoMeta({
  title: '登录 - 农优选'
})
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2 mb-4">
          <UIcon name="i-lucide-leaf" class="w-10 h-10 text-primary-600" />
          <span class="text-2xl font-bold text-gray-900 dark:text-white">农优选</span>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">欢迎回来</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">登录您的账户</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <UFormField label="用户名">
            <UInput
              v-model="form.username"
              placeholder="请输入用户名"
              icon="i-heroicons-user"
              size="lg"
              autocomplete="username"
              class="w-full"
            />
          </UFormField>

          <UFormField label="密码">
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              icon="i-heroicons-lock-closed"
              size="lg"
              autocomplete="current-password"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <UButton type="submit" block size="lg" :loading="loading">
            登录
          </UButton>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-500 dark:text-gray-400">
            还没有账户？
            <NuxtLink to="/auth/register" class="text-primary-600 hover:text-primary-700 font-medium">
              立即注册
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
