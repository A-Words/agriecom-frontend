<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useSessionStore } from '~/stores/session'

const cartStore = useCartStore()
const sessionStore = useSessionStore()
const toast = useToast()

// 检查登录状态
onMounted(async () => {
  if (!sessionStore.isAuthenticated) {
    toast.add({ title: '请先登录', color: 'warning' })
    navigateTo('/auth/login')
    return
  }
  await cartStore.fetchCart()
})

const formatPrice = (price: number) => `¥${price.toFixed(2)}`

// 更新商品数量
const updateQuantity = async (productId: number, quantity: number) => {
  if (quantity < 1) return
  try {
    await cartStore.updateItem(productId, { quantity })
  } catch {
    toast.add({ title: '更新失败', color: 'error' })
  }
}

// 删除商品
const removeItem = async (productId: number) => {
  try {
    await cartStore.removeItem(productId)
    toast.add({ title: '已删除', color: 'success' })
  } catch {
    toast.add({ title: '删除失败', color: 'error' })
  }
}

// 清空购物车
const clearCart = async () => {
  try {
    await cartStore.clearCart()
    toast.add({ title: '购物车已清空', color: 'success' })
  } catch {
    toast.add({ title: '清空失败', color: 'error' })
  }
}

// 去结算
const checkout = () => {
  if (cartStore.isEmpty) {
    toast.add({ title: '购物车是空的', color: 'warning' })
    return
  }
  navigateTo('/checkout')
}

useSeoMeta({
  title: '购物车 - 农优选'
})
</script>

<template>
  <div class="page-container">
    <h1 class="section-title">购物车</h1>

    <!-- 加载中 -->
    <div v-if="cartStore.loading && !cartStore.cart" class="animate-pulse space-y-4">
      <div v-for="i in 3" :key="i" class="bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
    </div>

    <!-- 空购物车 -->
    <div v-else-if="cartStore.isEmpty" class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
      <UIcon name="i-heroicons-shopping-cart" class="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-6">购物车是空的</p>
      <UButton to="/products">去选购</UButton>
    </div>

    <!-- 购物车内容 -->
    <div v-else class="space-y-6">
      <!-- 按店铺分组 -->
      <div
        v-for="shopCart in cartStore.cart?.shops"
        :key="shopCart.shopId"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
      >
        <!-- 店铺头部 -->
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <NuxtLink
            :to="`/shops/${shopCart.shopId}`"
            class="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
          >
            <UIcon name="i-heroicons-building-storefront" class="w-5 h-5" />
            <span class="font-medium">{{ shopCart.shopName }}</span>
          </NuxtLink>
        </div>

        <!-- 商品列表 -->
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="item in shopCart.items"
            :key="item.productId"
            class="p-4 flex items-center gap-4"
          >
            <!-- 商品图片 -->
            <NuxtLink :to="`/products/${item.productId}`" class="shrink-0">
              <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-gray-400" />
              </div>
            </NuxtLink>

            <!-- 商品信息 -->
            <div class="flex-1 min-w-0">
              <NuxtLink
                :to="`/products/${item.productId}`"
                class="text-gray-900 dark:text-white hover:text-primary-600 font-medium line-clamp-1"
              >
                {{ item.productName }}
              </NuxtLink>
              <p class="text-lg font-bold text-primary-600 dark:text-primary-400 mt-1">
                {{ formatPrice(item.price) }}
              </p>
              <p v-if="item.stock <= 5" class="text-xs text-orange-500 mt-1">
                库存仅剩 {{ item.stock }} 件
              </p>
            </div>

            <!-- 数量调整 -->
            <div class="flex items-center gap-2">
              <UButton
                icon="i-heroicons-minus"
                variant="outline"
                size="xs"
                :disabled="item.quantity <= 1 || cartStore.loading"
                @click="updateQuantity(item.productId, item.quantity - 1)"
              />
              <span class="w-8 text-center text-gray-900 dark:text-white">{{ item.quantity }}</span>
              <UButton
                icon="i-heroicons-plus"
                variant="outline"
                size="xs"
                :disabled="item.quantity >= item.stock || cartStore.loading"
                @click="updateQuantity(item.productId, item.quantity + 1)"
              />
            </div>

            <!-- 小计 -->
            <div class="text-right w-24">
              <p class="text-sm text-gray-500 dark:text-gray-400">小计</p>
              <p class="font-bold text-gray-900 dark:text-white">{{ formatPrice(item.subtotal) }}</p>
            </div>

            <!-- 删除 -->
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              color="error"
              size="sm"
              :loading="cartStore.loading"
              @click="removeItem(item.productId)"
            />
          </div>
        </div>

        <!-- 店铺小计 -->
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-right">
          <span class="text-gray-500 dark:text-gray-400">店铺合计: </span>
          <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
            {{ formatPrice(shopCart.subtotal) }}
          </span>
        </div>
      </div>

      <!-- 底部结算栏 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky bottom-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <UButton variant="ghost" color="error" @click="clearCart">
              清空购物车
            </UButton>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                共 {{ cartStore.totalItems }} 件商品
              </p>
              <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {{ formatPrice(cartStore.totalAmount) }}
              </p>
            </div>
            <UButton size="lg" @click="checkout">
              去结算
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
