<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useSessionStore } from '~/stores/session'
import { useUserApi, useOrdersApi } from '~/services/api'
import type { AddressResponse, CreateOrderRequest } from '~/types/api'

const cartStore = useCartStore()
const sessionStore = useSessionStore()
const userApi = useUserApi()
const ordersApi = useOrdersApi()
const toast = useToast()

// 检查登录和购物车
onMounted(async () => {
  if (!sessionStore.isAuthenticated) {
    toast.add({ title: '请先登录', color: 'warning' })
    navigateTo('/auth/login')
    return
  }

  await cartStore.fetchCart()
  if (cartStore.isEmpty) {
    toast.add({ title: '购物车是空的', color: 'warning' })
    navigateTo('/cart')
    return
  }
})

// 获取收货地址
const { data: addresses, refresh: refreshAddresses } = await useAsyncData(
  'checkout-addresses',
  () => userApi.listAddresses()
)

const selectedAddressId = ref<number | null>(null)
const submitting = ref(false)
const showAddressModal = ref(false)

// 默认选中默认地址
watch(addresses, (addrs) => {
  if (addrs?.length) {
    const defaultAddr = addrs.find(a => a.isDefault)
    selectedAddressId.value = defaultAddr?.id ?? addrs[0].id
  }
}, { immediate: true })

const selectedAddress = computed(() =>
  addresses.value?.find(a => a.id === selectedAddressId.value)
)

const formatPrice = (price: number) => `¥${price.toFixed(2)}`

const formatAddress = (addr: AddressResponse) => {
  return `${addr.province} ${addr.city} ${addr.district} ${addr.street}`
}

// 新增地址表单
const newAddress = reactive({
  recipientName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  street: '',
  postalCode: '',
  isDefault: false
})

const addingAddress = ref(false)

const handleAddAddress = async () => {
  if (!newAddress.recipientName || !newAddress.phone || !newAddress.province ||
      !newAddress.city || !newAddress.district || !newAddress.street) {
    toast.add({ title: '请填写完整地址信息', color: 'warning' })
    return
  }

  try {
    addingAddress.value = true
    const addr = await userApi.createAddress(newAddress)
    await refreshAddresses()
    selectedAddressId.value = addr.id
    showAddressModal.value = false
    toast.add({ title: '地址添加成功', color: 'success' })

    // 重置表单
    Object.assign(newAddress, {
      recipientName: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      street: '',
      postalCode: '',
      isDefault: false
    })
  } catch {
    toast.add({ title: '添加失败', color: 'error' })
  } finally {
    addingAddress.value = false
  }
}

// 提交订单
const handleSubmit = async () => {
  if (!selectedAddress.value) {
    toast.add({ title: '请选择收货地址', color: 'warning' })
    return
  }

  if (!cartStore.cart?.shops.length) {
    toast.add({ title: '购物车是空的', color: 'warning' })
    return
  }

  try {
    submitting.value = true

    // 构建订单商品列表
    const items = cartStore.cart.shops.flatMap(shop =>
      shop.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        stock: item.stock
      }))
    )

    const orderData: CreateOrderRequest = {
      items,
      shippingAddress: `${selectedAddress.value.recipientName} ${selectedAddress.value.phone} ${formatAddress(selectedAddress.value)}`
    }

    const order = await ordersApi.createOrder(orderData)

    // 清空购物车并跳转到订单详情
    await cartStore.fetchCart()
    toast.add({ title: '订单创建成功', color: 'success' })
    navigateTo(`/user/orders/${order.id}`)
  } catch (err: any) {
    toast.add({ title: err.message || '订单创建失败', color: 'error' })
  } finally {
    submitting.value = false
  }
}

useSeoMeta({
  title: '确认订单 - 农优选'
})
</script>

<template>
  <div class="page-container">
    <h1 class="section-title">确认订单</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 主内容 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 收货地址 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">收货地址</h2>
            <UButton variant="ghost" size="sm" @click="showAddressModal = true">
              <UIcon name="i-heroicons-plus" class="mr-1" />
              新增地址
            </UButton>
          </div>

          <div v-if="addresses?.length" class="space-y-3">
            <label
              v-for="addr in addresses"
              :key="addr.id"
              class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors"
              :class="selectedAddressId === addr.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'"
            >
              <input
                v-model="selectedAddressId"
                type="radio"
                :value="addr.id"
                class="mt-1"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-gray-900 dark:text-white">{{ addr.recipientName }}</span>
                  <span class="text-gray-600 dark:text-gray-400">{{ addr.phone }}</span>
                  <UBadge v-if="addr.isDefault" color="primary" size="xs">默认</UBadge>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatAddress(addr) }}
                </p>
              </div>
            </label>
          </div>

          <div v-else class="text-center py-8">
            <p class="text-gray-500 dark:text-gray-400 mb-4">暂无收货地址</p>
            <UButton @click="showAddressModal = true">添加地址</UButton>
          </div>
        </div>

        <!-- 商品列表 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">商品清单</h2>
          </div>

          <div
            v-for="shopCart in cartStore.cart?.shops"
            :key="shopCart.shopId"
            class="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <div class="px-4 py-2 bg-gray-50 dark:bg-gray-700">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ shopCart.shopName }}</span>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
              <div
                v-for="item in shopCart.items"
                :key="item.productId"
                class="p-4 flex items-center gap-4"
              >
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-gray-900 dark:text-white line-clamp-1">{{ item.productName }}</p>
                  <p class="text-sm text-gray-500">{{ formatPrice(item.price) }} × {{ item.quantity }}</p>
                </div>
                <p class="font-medium text-gray-900 dark:text-white">{{ formatPrice(item.subtotal) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单摘要 -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">订单摘要</h2>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">商品总数</span>
              <span class="text-gray-900 dark:text-white">{{ cartStore.totalItems }} 件</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">商品金额</span>
              <span class="text-gray-900 dark:text-white">{{ formatPrice(cartStore.totalAmount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">运费</span>
              <span class="text-green-600">免运费</span>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
            <div class="flex justify-between items-center mb-4">
              <span class="text-gray-900 dark:text-white font-medium">应付金额</span>
              <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {{ formatPrice(cartStore.totalAmount) }}
              </span>
            </div>

            <UButton
              block
              size="lg"
              :loading="submitting"
              :disabled="!selectedAddress"
              @click="handleSubmit"
            >
              提交订单
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增地址弹窗 -->
    <UModal v-model:open="showAddressModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">新增收货地址</h3>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="收货人">
                <UInput v-model="newAddress.recipientName" placeholder="请输入收货人姓名" />
              </UFormField>
              <UFormField label="手机号">
                <UInput v-model="newAddress.phone" placeholder="请输入手机号" />
              </UFormField>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="省份">
                <UInput v-model="newAddress.province" placeholder="省份" />
              </UFormField>
              <UFormField label="城市">
                <UInput v-model="newAddress.city" placeholder="城市" />
              </UFormField>
              <UFormField label="区县">
                <UInput v-model="newAddress.district" placeholder="区县" />
              </UFormField>
            </div>

            <UFormField label="详细地址">
              <UInput v-model="newAddress.street" placeholder="请输入详细地址" />
            </UFormField>

            <UFormField label="邮政编码">
              <UInput v-model="newAddress.postalCode" placeholder="邮政编码（选填）" />
            </UFormField>

            <UCheckbox v-model="newAddress.isDefault" label="设为默认地址" />
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <UButton variant="ghost" @click="showAddressModal = false">取消</UButton>
            <UButton :loading="addingAddress" @click="handleAddAddress">确定</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
