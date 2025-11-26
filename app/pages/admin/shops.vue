<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useAdminShopApi } from '~/services/api'
import type { DetailResponse, ShopStatus } from '~/types/api'

const sessionStore = useSessionStore()
const adminApi = useAdminShopApi()
const toast = useToast()

onMounted(() => {
  if (!sessionStore.isAuthenticated) {
    toast.add({ title: '请先登录', color: 'warning' })
    navigateTo('/auth/login')
    return
  }

  if (!sessionStore.authUser?.roles?.includes('ADMIN')) {
    toast.add({ title: '无权限访问', color: 'error' })
    navigateTo('/')
  }
})

const currentStatus = ref<ShopStatus>('PENDING_REVIEW')

const { data: shops, status, refresh } = await useAsyncData<DetailResponse[]>(
  'admin-shops',
  () => adminApi.listByStatus({ status: currentStatus.value }),
  { watch: [currentStatus] }
)

const processing = ref<number | null>(null)

const statusTabs = [
  { value: 'PENDING_REVIEW', label: '待审核', color: 'warning' },
  { value: 'ACTIVE', label: '正常', color: 'success' },
  { value: 'SUSPENDED', label: '已封禁', color: 'error' },
  { value: 'REJECTED', label: '已驳回', color: 'neutral' }
]

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('zh-CN')

const handleApprove = async (shopId: number) => {
  if (!confirm('确定要通过该店铺的申请吗？')) return

  try {
    processing.value = shopId
    await adminApi.approve(shopId)
    await refresh()
    toast.add({ title: '店铺已通过审核', color: 'success' })
  } catch (err: any) {
    toast.add({ title: err.message || '操作失败', color: 'error' })
  } finally {
    processing.value = null
  }
}

const handleReject = async (shopId: number) => {
  if (!confirm('确定要驳回该店铺的申请吗？')) return

  try {
    processing.value = shopId
    await adminApi.reject(shopId)
    await refresh()
    toast.add({ title: '店铺申请已驳回', color: 'success' })
  } catch (err: any) {
    toast.add({ title: err.message || '操作失败', color: 'error' })
  } finally {
    processing.value = null
  }
}

const handleSuspend = async (shopId: number) => {
  if (!confirm('确定要封禁该店铺吗？')) return

  try {
    processing.value = shopId
    await adminApi.suspend(shopId)
    await refresh()
    toast.add({ title: '店铺已封禁', color: 'success' })
  } catch (err: any) {
    toast.add({ title: err.message || '操作失败', color: 'error' })
  } finally {
    processing.value = null
  }
}

useSeoMeta({
  title: '店铺审核 - 农优选管理后台'
})
</script>

<template>
  <div class="page-container">
    <h1 class="section-title">店铺审核</h1>

    <!-- 状态标签 -->
    <div class="flex gap-2 mb-6">
      <UButton
        v-for="tab in statusTabs"
        :key="tab.value"
        :variant="currentStatus === tab.value ? 'solid' : 'ghost'"
        :color="currentStatus === tab.value ? (tab.color as any) : 'neutral'"
        @click="currentStatus = tab.value as ShopStatus"
      >
        {{ tab.label }}
      </UButton>
    </div>

    <!-- 加载中 -->
    <div v-if="status === 'pending'" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
    </div>

    <!-- 店铺列表 -->
    <div v-else-if="shops?.length" class="space-y-4">
      <div
        v-for="shop in shops"
        :key="shop.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            <img v-if="shop.logoUrl" :src="shop.logoUrl" :alt="shop.name" class="w-full h-full object-cover" />
            <UIcon v-else name="i-heroicons-building-storefront" class="w-8 h-8 text-gray-400" />
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ shop.name }}</h3>
              <UBadge
                :color="statusTabs.find(t => t.value === shop.status)?.color as any || 'neutral'"
              >
                {{ statusTabs.find(t => t.value === shop.status)?.label || shop.status }}
              </UBadge>
            </div>

            <p v-if="shop.description" class="text-gray-600 dark:text-gray-400 mb-3">
              {{ shop.description }}
            </p>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="text-gray-500">店铺ID: </span>
                <span class="text-gray-900 dark:text-white">{{ shop.id }}</span>
              </div>
              <div>
                <span class="text-gray-500">商品数: </span>
                <span class="text-gray-900 dark:text-white">{{ shop.productCount }}</span>
              </div>
              <div>
                <span class="text-gray-500">待处理订单: </span>
                <span class="text-gray-900 dark:text-white">{{ shop.pendingOrderCount }}</span>
              </div>
              <div>
                <span class="text-gray-500">申请时间: </span>
                <span class="text-gray-900 dark:text-white">{{ formatDate(shop.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-col gap-2">
            <template v-if="shop.status === 'PENDING_REVIEW'">
              <UButton
                color="success"
                size="sm"
                :loading="processing === shop.id"
                @click="handleApprove(shop.id)"
              >
                通过
              </UButton>
              <UButton
                color="error"
                variant="outline"
                size="sm"
                :loading="processing === shop.id"
                @click="handleReject(shop.id)"
              >
                驳回
              </UButton>
            </template>

            <template v-else-if="shop.status === 'ACTIVE'">
              <UButton
                color="error"
                variant="outline"
                size="sm"
                :loading="processing === shop.id"
                @click="handleSuspend(shop.id)"
              >
                封禁
              </UButton>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
      <UIcon name="i-heroicons-check-circle" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">暂无{{ statusTabs.find(t => t.value === currentStatus)?.label }}的店铺</p>
    </div>
  </div>
</template>
