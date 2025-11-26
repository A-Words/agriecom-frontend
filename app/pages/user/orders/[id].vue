<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useOrdersApi } from '~/services/api'
import type { OrderDetail } from '~/types/api'

const route = useRoute()
const orderId = Number(route.params.id)

const sessionStore = useSessionStore()
const ordersApi = useOrdersApi()
const toast = useToast()

onMounted(() => {
  if (!sessionStore.isAuthenticated) {
    toast.add({ title: '请先登录', color: 'warning' })
    navigateTo('/auth/login')
  }
})

const { data: order, status, refresh } = await useAsyncData<OrderDetail>(
  `order-${orderId}`,
  () => ordersApi.getOrderDetail(orderId)
)

const cancelling = ref(false)

const formatPrice = (price: number) => `¥${price.toFixed(2)}`
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('zh-CN')

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待付款', color: 'warning' },
  PAID: { label: '待发货', color: 'info' },
  SHIPPED: { label: '已发货', color: 'primary' },
  DELIVERED: { label: '已送达', color: 'success' },
  COMPLETED: { label: '已完成', color: 'success' },
  CANCELLED: { label: '已取消', color: 'neutral' }
}

const getStatusInfo = (status: string) => statusMap[status] || { label: status, color: 'neutral' }

const canCancel = computed(() => {
  const status = order.value?.status
  return status === 'PENDING' || status === 'PAID'
})

const handleCancel = async () => {
  if (!confirm('确定要取消订单吗？')) return

  try {
    cancelling.value = true
    await ordersApi.cancelOrder(orderId)
    await refresh()
    toast.add({ title: '订单已取消', color: 'success' })
  } catch (err: any) {
    toast.add({ title: err.message || '取消失败', color: 'error' })
  } finally {
    cancelling.value = false
  }
}

useSeoMeta({
  title: computed(() => `订单 #${orderId} - 农优选`)
})
</script>

<template>
  <div class="page-container">
    <!-- 面包屑 -->
    <UBreadcrumb class="mb-6">
      <UBreadcrumbItem to="/">首页</UBreadcrumbItem>
      <UBreadcrumbItem to="/user/orders">我的订单</UBreadcrumbItem>
      <UBreadcrumbItem>订单详情</UBreadcrumbItem>
    </UBreadcrumb>

    <!-- 加载中 -->
    <div v-if="status === 'pending'" class="animate-pulse space-y-4">
      <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
      <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
    </div>

    <template v-else-if="order">
      <!-- 订单状态 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">订单 #{{ order.id }}</h1>
              <UBadge :color="getStatusInfo(order.status).color as any" size="lg">
                {{ getStatusInfo(order.status).label }}
              </UBadge>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              下单时间: {{ formatDate(order.createdAt) }}
            </p>
          </div>

          <UButton
            v-if="canCancel"
            variant="outline"
            color="error"
            :loading="cancelling"
            @click="handleCancel"
          >
            取消订单
          </UButton>
        </div>
      </div>

      <!-- 收货地址 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">收货信息</h2>
        <p class="text-gray-600 dark:text-gray-400">{{ order.shippingAddress }}</p>
      </div>

      <!-- 子订单列表 -->
      <div class="space-y-4">
        <div
          v-for="shopOrder in order.shopOrders"
          :key="shopOrder.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
        >
          <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-building-storefront" class="w-5 h-5 text-gray-500" />
                <NuxtLink
                  :to="`/shops/${shopOrder.shopId}`"
                  class="font-medium text-gray-900 dark:text-white hover:text-primary-600"
                >
                  {{ shopOrder.shopName }}
                </NuxtLink>
              </div>
              <UBadge :color="getStatusInfo(shopOrder.status).color as any">
                {{ getStatusInfo(shopOrder.status).label }}
              </UBadge>
            </div>
          </div>

          <div class="p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
              子订单号: {{ shopOrder.id }}
            </p>
            <p class="text-right">
              <span class="text-gray-500">小计: </span>
              <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
                {{ formatPrice(shopOrder.totalAmount) }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- 订单汇总 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
        <div class="flex justify-between items-center">
          <span class="text-gray-500 dark:text-gray-400">订单总金额</span>
          <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {{ formatPrice(order.totalAmount) }}
          </span>
        </div>
      </div>
    </template>

    <!-- 未找到订单 -->
    <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
      <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">订单不存在</p>
      <UButton to="/user/orders">返回订单列表</UButton>
    </div>
  </div>
</template>
