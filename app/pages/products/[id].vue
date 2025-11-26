<script setup lang="ts">
import { useProductsApi } from '~/services/api'
import { useCartStore } from '~/stores/cart'
import { useSessionStore } from '~/stores/session'
import type { Detail } from '~/types/api'

const route = useRoute()
const productId = Number(route.params.id)

const productsApi = useProductsApi()
const cartStore = useCartStore()
const sessionStore = useSessionStore()
const toast = useToast()

// 获取商品详情
const { data: product, status } = await useAsyncData(
  `product-${productId}`,
  () => productsApi.getProductDetail(productId)
)

// 购买数量
const quantity = ref(1)
const adding = ref(false)

const formatPrice = (price: number) => `¥${price.toFixed(2)}`
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('zh-CN')

const maxQuantity = computed(() => Math.min(product.value?.stock ?? 0, 99))

const handleAddToCart = async () => {
  if (!sessionStore.isAuthenticated) {
    toast.add({ title: '请先登录', color: 'warning' })
    navigateTo('/auth/login')
    return
  }

  if (!product.value || product.value.stock <= 0) {
    toast.add({ title: '商品已售罄', color: 'error' })
    return
  }

  try {
    adding.value = true
    await cartStore.addItem({
      productId: product.value.id,
      quantity: quantity.value
    })
    toast.add({ title: '已加入购物车', color: 'success' })
  } catch {
    toast.add({ title: '添加失败', color: 'error' })
  } finally {
    adding.value = false
  }
}

const handleBuyNow = async () => {
  await handleAddToCart()
  if (!cartStore.error) {
    navigateTo('/cart')
  }
}

useSeoMeta({
  title: computed(() => product.value ? `${product.value.name} - 农优选` : '商品详情 - 农优选'),
  description: computed(() => product.value?.description || '')
})
</script>

<template>
  <div class="page-container">
    <!-- 面包屑 -->
    <UBreadcrumb class="mb-6">
      <UBreadcrumbItem to="/">首页</UBreadcrumbItem>
      <UBreadcrumbItem to="/products">全部商品</UBreadcrumbItem>
      <UBreadcrumbItem>{{ product?.name || '商品详情' }}</UBreadcrumbItem>
    </UBreadcrumb>

    <!-- 加载中 -->
    <div v-if="status === 'pending'" class="animate-pulse">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div class="space-y-4">
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- 商品详情 -->
    <div v-else-if="product" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        <!-- 商品图片 -->
        <div class="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <UIcon name="i-heroicons-photo" class="w-24 h-24 text-gray-400" />
        </div>

        <!-- 商品信息 -->
        <div class="space-y-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {{ product.name }}
            </h1>
            <p v-if="product.description" class="text-gray-600 dark:text-gray-400">
              {{ product.description }}
            </p>
          </div>

          <!-- 价格 -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <span class="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {{ formatPrice(product.price) }}
            </span>
            <span class="text-sm text-gray-500 ml-2">/ 份</span>
          </div>

          <!-- 商品属性 -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-gray-500 dark:text-gray-400">分类:</span>
              <span class="text-gray-900 dark:text-white">{{ product.category || '未分类' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 dark:text-gray-400">产地:</span>
              <span class="text-gray-900 dark:text-white">{{ product.origin || '未知' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 dark:text-gray-400">库存:</span>
              <span :class="product.stock > 0 ? 'text-green-600' : 'text-red-500'">
                {{ product.stock > 0 ? `${product.stock} 件` : '已售罄' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 dark:text-gray-400">销量:</span>
              <span class="text-gray-900 dark:text-white">{{ product.sales }} 件</span>
            </div>
          </div>

          <!-- 店铺信息 -->
          <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
            <NuxtLink
              :to="`/shops/${product.shopId}`"
              class="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-primary-600"
            >
              <UIcon name="i-heroicons-building-storefront" class="w-5 h-5" />
              <span>{{ product.shopName }}</span>
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
            </NuxtLink>
          </div>

          <!-- 数量选择 -->
          <div class="flex items-center gap-4">
            <span class="text-gray-500 dark:text-gray-400">数量:</span>
            <div class="flex items-center gap-2">
              <UButton
                icon="i-heroicons-minus"
                variant="outline"
                size="sm"
                :disabled="quantity <= 1"
                @click="quantity = Math.max(1, quantity - 1)"
              />
              <UInput
                v-model.number="quantity"
                type="number"
                :min="1"
                :max="maxQuantity"
                class="w-20 text-center"
                size="sm"
              />
              <UButton
                icon="i-heroicons-plus"
                variant="outline"
                size="sm"
                :disabled="quantity >= maxQuantity"
                @click="quantity = Math.min(maxQuantity, quantity + 1)"
              />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-4 pt-4">
            <UButton
              size="lg"
              variant="outline"
              :loading="adding"
              :disabled="product.stock <= 0"
              class="flex-1"
              @click="handleAddToCart"
            >
              <UIcon name="i-heroicons-shopping-cart" class="mr-2" />
              加入购物车
            </UButton>
            <UButton
              size="lg"
              :disabled="product.stock <= 0"
              class="flex-1"
              @click="handleBuyNow"
            >
              立即购买
            </UButton>
          </div>
        </div>
      </div>

      <!-- 商品详情说明 -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">商品详情</h2>
        <div class="prose dark:prose-invert max-w-none">
          <p class="text-gray-600 dark:text-gray-400">
            {{ product.description || '暂无详细描述' }}
          </p>
          <div class="mt-4 text-sm text-gray-500">
            <p>上架时间: {{ product.publishedAt ? formatDate(product.publishedAt) : '未上架' }}</p>
            <p>更新时间: {{ formatDate(product.updatedAt) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 未找到商品 -->
    <div v-else class="text-center py-16">
      <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">商品不存在或已下架</p>
      <UButton to="/products">浏览其他商品</UButton>
    </div>
  </div>
</template>
