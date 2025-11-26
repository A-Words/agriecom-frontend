<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useShopApi } from '~/services/api'
import type { DetailResponse, UpdateRequest } from '~/types/api'

const sessionStore = useSessionStore()
const shopApi = useShopApi()
const toast = useToast()

onMounted(() => {
  if (!sessionStore.isAuthenticated) {
    toast.add({ title: '请先登录', color: 'warning' })
    navigateTo('/auth/login')
    return
  }

  if (!sessionStore.authUser?.roles?.includes('SELLER')) {
    toast.add({ title: '您还不是商户', color: 'warning' })
    navigateTo('/seller/apply')
  }
})

const { data: shop, status, refresh } = await useAsyncData<DetailResponse>('my-shop', () => shopApi.getMyShop())

const editing = ref(false)
const saving = ref(false)

const form = reactive<UpdateRequest>({
  name: '',
  description: '',
  logoUrl: ''
})

watch(shop, (s) => {
  if (s) {
    form.name = s.name
    form.description = s.description || ''
    form.logoUrl = s.logoUrl || ''
  }
}, { immediate: true })

const handleSave = async () => {
  if (!form.name) {
    toast.add({ title: '请输入店铺名称', color: 'warning' })
    return
  }

  try {
    saving.value = true
    await shopApi.updateMyShop(form)
    await refresh()
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
  if (shop.value) {
    form.name = shop.value.name
    form.description = shop.value.description || ''
    form.logoUrl = shop.value.logoUrl || ''
  }
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING_REVIEW: { label: '待审核', color: 'warning' },
  ACTIVE: { label: '正常营业', color: 'success' },
  SUSPENDED: { label: '已封禁', color: 'error' },
  REJECTED: { label: '已驳回', color: 'neutral' }
}

const getStatusInfo = (status: string) => statusMap[status] || { label: status, color: 'neutral' }
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('zh-CN')

useSeoMeta({
  title: '我的店铺 - 农优选'
})
</script>

<template>
  <div class="page-container">
    <h1 class="section-title">我的店铺</h1>

    <!-- 加载中 -->
    <div v-if="status === 'pending'" class="animate-pulse">
      <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
    </div>

    <template v-else-if="shop">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <!-- 头部 -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <img v-if="shop.logoUrl" :src="shop.logoUrl" :alt="shop.name" class="w-full h-full object-cover" />
                <UIcon v-else name="i-heroicons-building-storefront" class="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <div class="flex items-center gap-3">
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ shop.name }}</h2>
                  <UBadge :color="getStatusInfo(shop.status).color as any">
                    {{ getStatusInfo(shop.status).label }}
                  </UBadge>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  入驻时间: {{ formatDate(shop.createdAt) }}
                </p>
              </div>
            </div>

            <UButton v-if="!editing && shop.status === 'ACTIVE'" variant="outline" @click="editing = true">
              <UIcon name="i-heroicons-pencil" class="mr-2" />
              编辑信息
            </UButton>
          </div>
        </div>

        <!-- 统计数据 -->
        <div class="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700">
          <div class="p-6 text-center">
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ shop.productCount }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">商品数</p>
          </div>
          <div class="p-6 text-center">
            <p class="text-3xl font-bold text-orange-500">{{ shop.pendingOrderCount }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">待处理订单</p>
          </div>
          <div class="p-6 text-center">
            <p class="text-3xl font-bold text-green-500">{{ shop.completedOrderCount }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">已完成订单</p>
          </div>
        </div>

        <!-- 店铺信息 -->
        <div class="p-6">
          <form v-if="editing" @submit.prevent="handleSave" class="space-y-6 max-w-xl">
            <UFormField label="店铺名称" required>
              <UInput v-model="form.name" placeholder="请输入店铺名称" />
            </UFormField>

            <UFormField label="店铺简介">
              <UTextarea v-model="form.description" placeholder="请输入店铺简介" :rows="4" />
            </UFormField>

            <UFormField label="店铺Logo">
              <UInput v-model="form.logoUrl" placeholder="请输入Logo图片URL" />
            </UFormField>

            <div class="flex gap-4">
              <UButton type="submit" :loading="saving">保存</UButton>
              <UButton variant="ghost" type="button" @click="handleCancel">取消</UButton>
            </div>
          </form>

          <div v-else>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">店铺简介</h3>
            <p class="text-gray-600 dark:text-gray-400">{{ shop.description || '暂无简介' }}</p>
          </div>
        </div>

        <!-- 快捷入口 -->
        <div class="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">快捷操作</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NuxtLink
              to="/seller/products"
              class="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <UIcon name="i-heroicons-cube" class="w-8 h-8 text-primary-600" />
              <span class="text-sm text-gray-700 dark:text-gray-300">商品管理</span>
            </NuxtLink>
            <NuxtLink
              to="/seller/orders"
              class="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <UIcon name="i-heroicons-truck" class="w-8 h-8 text-orange-500" />
              <span class="text-sm text-gray-700 dark:text-gray-300">订单管理</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>

    <!-- 未找到店铺 -->
    <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
      <UIcon name="i-heroicons-building-storefront" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">您还没有店铺</p>
      <UButton to="/seller/apply">立即申请开店</UButton>
    </div>
  </div>
</template>
