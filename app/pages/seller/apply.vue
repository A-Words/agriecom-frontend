<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useShopApi } from '~/services/api'
import type { CreateRequest } from '~/types/api'

const sessionStore = useSessionStore()
const shopApi = useShopApi()
const toast = useToast()

onMounted(() => {
  if (!sessionStore.isAuthenticated) {
    toast.add({ title: '请先登录', color: 'warning' })
    navigateTo('/auth/login')
  }
})

const submitting = ref(false)

const form = reactive<CreateRequest>({
  name: '',
  description: '',
  logoUrl: ''
})

const handleSubmit = async () => {
  if (!form.name) {
    toast.add({ title: '请输入店铺名称', color: 'warning' })
    return
  }

  try {
    submitting.value = true
    await shopApi.applyShop(form)
    toast.add({ title: '申请已提交，请等待审核', color: 'success' })
    navigateTo('/seller/shop')
  } catch (err: any) {
    toast.add({ title: err.message || '申请失败', color: 'error' })
  } finally {
    submitting.value = false
  }
}

useSeoMeta({
  title: '入驻开店 - 农优选'
})
</script>

<template>
  <div class="page-container">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">入驻开店</h1>
        <p class="text-gray-500 dark:text-gray-400">加入农优选，将您的优质农产品带给更多消费者</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <UFormField label="店铺名称" required hint="2-50个字符">
            <UInput
              v-model="form.name"
              placeholder="请输入店铺名称"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField label="店铺简介" hint="简要介绍您的店铺特色">
            <UTextarea
              v-model="form.description"
              placeholder="请输入店铺简介"
              :rows="4"
              class="w-full"
            />
          </UFormField>

          <UFormField label="店铺Logo" hint="请输入图片URL">
            <UInput
              v-model="form.logoUrl"
              placeholder="https://example.com/logo.png"
              class="w-full"
            />
          </UFormField>

          <!-- Logo预览 -->
          <div v-if="form.logoUrl" class="flex items-center gap-4">
            <span class="text-sm text-gray-500">预览:</span>
            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <img :src="form.logoUrl" alt="Logo预览" class="w-full h-full object-cover" />
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 class="font-medium text-blue-900 dark:text-blue-200 mb-2">入驻须知</h3>
            <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• 提交申请后，平台将在1-3个工作日内完成审核</li>
              <li>• 审核通过后，您即可开始上架商品</li>
              <li>• 请确保提供真实、合法的店铺信息</li>
            </ul>
          </div>

          <UButton type="submit" block size="lg" :loading="submitting">
            提交申请
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>
