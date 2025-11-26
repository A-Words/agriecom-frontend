<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useOrdersApi } from '~/services/api'
import type { ShopOrderDetail, ShipRequest } from '~/types/api'

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

const { data: order, status, refresh } = await useAsyncData(
  `shop-order-${orderId}`,
  () => ordersApi.getShopOrderDetail(orderId)
)

// 发货
const showShipModal = ref(false)
const shipForm = reactive<ShipRequest>({
  logisticsProvider: '',
  trackingNumber: ''
})
const shipping = ref(false)

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

const canShip = computed(() => order.value?.status === 'PAID')

const handleShip = () => {
  shipForm.logisticsProvider = order.value?.logisticsProvider || ''
  shipForm.trackingNumber = order.value?.trackingNumber || ''
  showShipModal.value = true
}

const confirmShip = async () => {
  try {
    shipping.value = true
    await ordersApi.shipOrder(orderId, shipForm)
    await refresh()
    showShipModal.value = false
    toast.add({ title: '发货成功', color: 'success' })
  } catch (err: any) {
    toast.add({ title: err.message || '发货失败', color: 'error' })
  } finally {
    shipping.value = false
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
      <UBreadcrumbItem to="/seller/orders">订单管理</UBreadcrumbItem>
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

          <UButton v-if="canShip" @click="handleShip">
            <UIcon name="i-heroicons-truck" class="mr-2" />
            发货
          </UButton>
        </div>
      </div>

      <!-- 收货信息 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">收货信息</h2>
        <p class="text-gray-600 dark:text-gray-400">{{ order.shippingAddress }}</p>
      </div>

      <!-- 物流信息 -->
      <div v-if="order.logisticsProvider || order.trackingNumber" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">物流信息</h2>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500 dark:text-gray-400">物流公司: </span>
            <span class="text-gray-900 dark:text-white">{{ order.logisticsProvider || '-' }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">快递单号: </span>
            <span class="text-gray-900 dark:text-white">{{ order.trackingNumber || '-' }}</span>
          </div>
          <div v-if="order.shippedAt">
            <span class="text-gray-500 dark:text-gray-400">发货时间: </span>
            <span class="text-gray-900 dark:text-white">{{ formatDate(order.shippedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">商品明细</h2>
        </div>

        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="p-4 flex items-center gap-4"
          >
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
              <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 dark:text-white">{{ item.productName }}</p>
              <p class="text-sm text-gray-500">{{ formatPrice(item.price) }} × {{ item.quantity }}</p>
            </div>
            <p class="font-medium text-gray-900 dark:text-white">{{ formatPrice(item.subtotal) }}</p>
          </div>
        </div>

        <div class="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
          <span class="text-gray-500 dark:text-gray-400">订单总额: </span>
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
      <UButton to="/seller/orders">返回订单列表</UButton>
    </div>

    <!-- 发货弹窗 -->
    <UModal v-model:open="showShipModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">订单发货</h3>

          <form @submit.prevent="confirmShip" class="space-y-4">
            <UFormField label="物流公司">
              <UInput v-model="shipForm.logisticsProvider" placeholder="如：顺丰速运" />
            </UFormField>

            <UFormField label="快递单号">
              <UInput v-model="shipForm.trackingNumber" placeholder="请输入快递单号" />
            </UFormField>

            <div class="flex justify-end gap-3 pt-4">
              <UButton variant="ghost" type="button" @click="showShipModal = false">取消</UButton>
              <UButton type="submit" :loading="shipping">确认发货</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>
