<script setup lang="ts">
import { useSessionStore } from '~/stores/session'

const sessionStore = useSessionStore()
const toast = useToast()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const showPassword = ref(false)

const handleRegister = async () => {
  if (!form.username || !form.password) {
    toast.add({ title: '请填写完整信息', color: 'warning' })
    return
  }

  if (form.username.length < 3) {
    toast.add({ title: '用户名至少3个字符', color: 'warning' })
    return
  }

  if (form.password.length < 6) {
    toast.add({ title: '密码至少6个字符', color: 'warning' })
    return
  }

  if (form.password !== form.confirmPassword) {
    toast.add({ title: '两次输入的密码不一致', color: 'warning' })
    return
  }

  try {
    loading.value = true
    await sessionStore.register({
      username: form.username,
      password: form.password
    })
    toast.add({ title: '注册成功', color: 'success' })
    navigateTo('/')
  } catch (err: any) {
    toast.add({ title: err.message || '注册失败', color: 'error' })
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
  title: '注册 - 农优选'
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">创建账户</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">加入农优选，开启健康生活</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <UFormField label="用户名" hint="3-20个字符">
            <UInput
              v-model="form.username"
              placeholder="请输入用户名"
              icon="i-heroicons-user"
              size="lg"
              autocomplete="username"
            />
          </UFormField>

          <UFormField label="密码" hint="至少6个字符">
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              icon="i-heroicons-lock-closed"
              size="lg"
              autocomplete="new-password"
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

          <UFormField label="确认密码">
            <UInput
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请再次输入密码"
              icon="i-heroicons-lock-closed"
              size="lg"
              autocomplete="new-password"
            />
          </UFormField>

          <UButton type="submit" block size="lg" :loading="loading">
            注册
          </UButton>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-500 dark:text-gray-400">
            已有账户？
            <NuxtLink to="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
              立即登录
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
