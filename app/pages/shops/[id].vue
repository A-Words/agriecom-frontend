<script setup lang="ts">
import { useShopApi } from '~/services/api'
import type { PublicDetail, ProductSummary } from '~/types/api'

const route = useRoute()
const shopId = Number(route.params.id)

const shopApi = useShopApi()

const { data, status } = await useAsyncData<PublicDetail>(
  `shop-${shopId}`,
  () => shopApi.getShop(shopId)
)

const shop = computed(() => data.value?.shop)
const products = computed<ProductSummary[]>(() => data.value?.products ?? [])

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('zh-CN')

useSeoMeta({
  title: computed(() => shop.value ? `${shop.value.name} - 农优选` : '店铺详情 - 农优选'),
  description: computed(() => shop.value?.description || '')
})
</script>

<template>
  <div class="page-container">
    <!-- 面包屑 -->
    <UBreadcrumb
      class="mb-6"
      :items="[
        { label: '首页', to: '/' },
        { label: '店铺', to: '/shops' },
        { label: shop?.name || '店铺详情' }
      ]"
    />

    <!-- 加载中 -->
    <div v-if="status === 'pending'" class="animate-pulse space-y-6">
      <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-40"></div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i">
          <div class="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square"></div>
        </div>
      </div>
    </div>

    <template v-else-if="shop">
      <!-- 店铺信息 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div class="flex items-start gap-6">
          <div class="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
            <img
              v-if="shop.logoUrl"
              :src="shop.logoUrl"
              :alt="shop.name"
              class="w-full h-full object-cover"
            />
            <UIcon v-else name="i-heroicons-building-storefront" class="w-12 h-12 text-gray-400" />
          </div>
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {{ shop.name }}
            </h1>
            <p v-if="shop.description" class="text-gray-600 dark:text-gray-400 mb-4">
              {{ shop.description }}
            </p>
            <div class="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-cube" class="w-4 h-4" />
                {{ shop.productCount }} 件商品
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                入驻时间: {{ formatDate(shop.createdAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 店铺商品 -->
      <div>
        <h2 class="section-title">店铺商品</h2>

        <div v-if="products.length" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>

        <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
          <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400">该店铺暂无商品</p>
        </div>
      </div>
    </template>

    <!-- 未找到店铺 -->
    <div v-else class="text-center py-16">
      <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">店铺不存在</p>
      <UButton to="/shops">浏览其他店铺</UButton>
    </div>
  </div>
</template>
