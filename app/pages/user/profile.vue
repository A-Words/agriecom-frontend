<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useUserApi } from '~/services/api'
import type { UpdateProfileRequest } from '~/types/api'

const sessionStore = useSessionStore()
const userApi = useUserApi()
const toast = useToast()

// 检查登录
onMounted(async () => {
  if (!sessionStore.isAuthenticated) {
    toast.add({ title: '请先登录', color: 'warning' })
    navigateTo('/auth/login')
    return
  }
  await sessionStore.fetchProfile()
})

const editing = ref(false)
const saving = ref(false)

const form = reactive<UpdateProfileRequest>({
  nickname: '',
  email: '',
  phone: '',
  bio: '',
  avatarUrl: ''
})

// 初始化表单
watch(() => sessionStore.profile, (profile) => {
  if (profile) {
    form.nickname = profile.nickname || ''
    form.email = profile.email || ''
    form.phone = profile.phone || ''
    form.bio = profile.bio || ''
    form.avatarUrl = profile.avatarUrl || ''
  }
}, { immediate: true })

const handleSave = async () => {
  try {
    saving.value = true
    await userApi.updateProfile(form)
    await sessionStore.fetchProfile()
    editing.value = false
    toast.add({ title: '保存成功', color: 'success' })
  } catch (err: any) {
    toast.add({ title: err.message || '保存失败', color: 'error' })
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  editing.value = false
  if (sessionStore.profile) {
    form.nickname = sessionStore.profile.nickname || ''
    form.email = sessionStore.profile.email || ''
    form.phone = sessionStore.profile.phone || ''
    form.bio = sessionStore.profile.bio || ''
    form.avatarUrl = sessionStore.profile.avatarUrl || ''
  }
}

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('zh-CN')

useSeoMeta({
  title: '个人中心 - 农优选'
})
</script>

<template>
  <div class="page-container">
    <h1 class="section-title">个人中心</h1>

    <div v-if="sessionStore.loading" class="animate-pulse space-y-4">
      <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-40"></div>
    </div>

    <div v-else-if="sessionStore.profile" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              <img
                v-if="sessionStore.profile.avatarUrl"
                :src="sessionStore.profile.avatarUrl"
                :alt="sessionStore.profile.nickname || sessionStore.profile.username"
                class="w-full h-full object-cover"
              />
              <UIcon v-else name="i-heroicons-user-circle" class="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ sessionStore.profile.nickname || sessionStore.profile.username }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                @{{ sessionStore.profile.username }}
              </p>
              <div class="flex gap-2 mt-2">
                <UBadge
                  v-for="role in sessionStore.profile.roles"
                  :key="role"
                  :color="role === 'ADMIN' ? 'error' : role === 'MERCHANT' ? 'warning' : 'primary'"
                  size="sm"
                >
                  {{ role === 'ADMIN' ? '管理员' : role === 'MERCHANT' ? '商户' : '用户' }}
                </UBadge>
              </div>
            </div>
          </div>

          <UButton
            v-if="!editing"
            variant="outline"
            @click="editing = true"
          >
            <UIcon name="i-heroicons-pencil" class="mr-2" />
            编辑资料
          </UButton>
        </div>
      </div>

      <!-- 资料表单 -->
      <div class="p-6">
        <form v-if="editing" @submit.prevent="handleSave" class="space-y-6 max-w-xl">
          <UFormField label="昵称">
            <UInput v-model="form.nickname" placeholder="请输入昵称" class="w-full" />
          </UFormField>

          <UFormField label="邮箱">
            <UInput v-model="form.email" type="email" placeholder="请输入邮箱" class="w-full" />
          </UFormField>

          <UFormField label="手机号">
            <UInput v-model="form.phone" placeholder="请输入手机号" class="w-full" />
          </UFormField>

          <UFormField label="头像URL">
            <UInput v-model="form.avatarUrl" placeholder="请输入头像图片链接" class="w-full" />
          </UFormField>

          <UFormField label="个人简介">
            <UTextarea v-model="form.bio" placeholder="介绍一下自己吧" :rows="3" class="w-full" />
          </UFormField>

          <div class="flex gap-4">
            <UButton type="submit" :loading="saving">保存</UButton>
            <UButton variant="ghost" @click="handleCancel">取消</UButton>
          </div>
        </form>

        <div v-else class="space-y-4 max-w-xl">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">昵称</p>
              <p class="text-gray-900 dark:text-white">{{ sessionStore.profile.nickname || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">用户名</p>
              <p class="text-gray-900 dark:text-white">{{ sessionStore.profile.username }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">邮箱</p>
              <p class="text-gray-900 dark:text-white">{{ sessionStore.profile.email || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">手机号</p>
              <p class="text-gray-900 dark:text-white">{{ sessionStore.profile.phone || '-' }}</p>
            </div>
          </div>

          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">个人简介</p>
            <p class="text-gray-900 dark:text-white">{{ sessionStore.profile.bio || '暂无简介' }}</p>
          </div>

          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              注册时间: {{ formatDate(sessionStore.profile.createdAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
