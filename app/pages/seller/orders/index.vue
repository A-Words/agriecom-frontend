<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useOrdersApi } from '~/services/api'
import type { ShopOrderSummary, ShipRequest } from '~/types/api'

const sessionStore = useSessionStore()
const ordersApi = useOrdersApi()
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

const page = ref(0)
const size = ref(10)

const { data, status, refresh } = await useAsyncData(
  'shop-orders',
  () => ordersApi.listShopOrders({ page: page.value, size: size.value }),
  { watch: [page] }
)

const orders = computed<ShopOrderSummary[]>(() => data.value?.items ?? [])
const totalElements = computed(() => data.value?.totalElements ?? 0)
const totalPages = computed(() => data.value?.totalPages ?? 0)

// 发货弹窗
const showShipModal = ref(false)
const shippingOrderId = ref<number | null>(null)
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

const canShip = (status: string) => status === 'PAID'

const handleShip = (orderId: number) => {
  shippingOrderId.value = orderId
  shipForm.logisticsProvider = ''
  shipForm.trackingNumber = ''
  showShipModal.value = true
}

const confirmShip = async () => {
  if (!shippingOrderId.value) return

  try {
    shipping.value = true
    await ordersApi.shipOrder(shippingOrderId.value, shipForm)
    await refresh()
    showShipModal.value = false
    toast.add({ title: '发货成功', color: 'success' })
  } catch (err: any) {
    toast.add({ title: err.message || '发货失败', color: 'error' })
  } finally {
    shipping.value = false
  }
}

const handlePageChange = (newPage: number) => {
  page.value = newPage - 1
}

useSeoMeta({
  title: '订单管理 - 农优选'
})
</script>

<template>
  <div class="page-container">
    <h1 class="section-title">订单管理</h1>

    <!-- 加载中 -->
    <div v-if="status === 'pending'" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
    </div>

    <!-- 订单列表 -->
    <div v-else-if="orders.length" class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">订单号: {{ order.id }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(order.createdAt) }}</span>
            <UBadge :color="getStatusInfo(order.status).color as any">
              {{ getStatusInfo(order.status).label }}
            </UBadge>
          </div>
          <div class="text-right">
            <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
              {{ formatPrice(order.totalAmount) }}
            </span>
          </div>
        </div>

        <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <UIcon name="i-heroicons-map-pin" class="w-4 h-4 inline mr-1" />
          {{ order.shippingAddress }}
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <NuxtLink
            :to="`/seller/orders/${order.id}`"
            class="text-primary-600 hover:text-primary-700 text-sm"
          >
            查看详情
          </NuxtLink>

          <UButton
            v-if="canShip(order.status)"
            size="sm"
            @click="handleShip(order.id)"
          >
            发货
          </UButton>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
      <UIcon name="i-heroicons-truck" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">暂无订单</p>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <UPagination
        :total="totalElements"
        :items-per-page="size"
        :default-page="page + 1"
        @update:page="handlePageChange"
      />
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
