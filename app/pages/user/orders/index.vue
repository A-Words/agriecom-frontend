<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useOrdersApi } from '~/services/api'
import type { OrderSummary, PageResultOrderSummary } from '~/types/api'

const sessionStore = useSessionStore()
const ordersApi = useOrdersApi()
const toast = useToast()

onMounted(() => {
  if (!sessionStore.isAuthenticated) {
    toast.add({ title: '请先登录', color: 'warning' })
    navigateTo('/auth/login')
  }
})

const page = ref(0)
const size = ref(10)

const { data, status, refresh } = await useAsyncData<PageResultOrderSummary>(
  'my-orders',
  () => ordersApi.listMyOrders({ page: page.value, size: size.value }),
  { watch: [page] }
)

const orders = computed<OrderSummary[]>(() => data.value?.items ?? [])
const totalElements = computed(() => data.value?.totalElements ?? 0)
const totalPages = computed(() => data.value?.totalPages ?? 0)

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

const handlePageChange = (newPage: number) => {
  page.value = newPage - 1
}

useSeoMeta({
  title: '我的订单 - 农优选'
})
</script>

<template>
  <div class="page-container">
    <h1 class="section-title">我的订单</h1>

    <!-- 加载中 -->
    <div v-if="status === 'pending'" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
    </div>

    <!-- 订单列表 -->
    <div v-else-if="orders.length" class="space-y-4">
      <NuxtLink
        v-for="order in orders"
        :key="order.id"
        :to="`/user/orders/${order.id}`"
        class="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500 dark:text-gray-400">订单号: {{ order.id }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(order.createdAt) }}</span>
            </div>
            <UBadge :color="getStatusInfo(order.status).color as any">
              {{ getStatusInfo(order.status).label }}
            </UBadge>
          </div>
        </div>

        <div class="p-4">
          <!-- 子订单 -->
          <div class="space-y-3">
            <div
              v-for="shopOrder in order.shopOrders"
              :key="shopOrder.id"
              class="flex items-center justify-between text-sm"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-building-storefront" class="w-4 h-4 text-gray-400" />
                <span class="text-gray-700 dark:text-gray-300">{{ shopOrder.shopName }}</span>
                <UBadge size="xs" :color="getStatusInfo(shopOrder.status).color as any">
                  {{ getStatusInfo(shopOrder.status).label }}
                </UBadge>
              </div>
              <span class="text-gray-600 dark:text-gray-400">{{ formatPrice(shopOrder.totalAmount) }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              共 {{ order.shopOrders.length }} 个店铺
            </span>
            <div class="text-right">
              <span class="text-gray-500 dark:text-gray-400 text-sm">订单金额: </span>
              <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
                {{ formatPrice(order.totalAmount) }}
              </span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
      <UIcon name="i-heroicons-clipboard-document-list" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">暂无订单</p>
      <UButton to="/products">去选购</UButton>
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
  </div>
</template>
