<script setup lang="ts">
import { useProductsApi, useShopApi } from '~/services/api'
import type { ProductSummary, PublicSummary } from '~/types/api'

const productsApi = useProductsApi()
const shopApi = useShopApi()

// 获取热门商品
const { data: productsData, status: productsStatus } = await useAsyncData(
  'hot-products',
  () => productsApi.listProducts({ size: 8, sort: ['sales,desc'] })
)

// 获取推荐店铺
const { data: shopsData, status: shopsStatus } = await useAsyncData(
  'featured-shops',
  () => shopApi.listShops({ size: 6 })
)

const products = computed<ProductSummary[]>(() => (productsData.value as any)?.items ?? [])
const shops = computed<PublicSummary[]>(() => (shopsData.value as any)?.items ?? [])

// 分类
const categories = [
  { name: '新鲜蔬菜', icon: 'i-heroicons-fire', color: 'text-green-500' },
  { name: '时令水果', icon: 'i-heroicons-sun', color: 'text-orange-500' },
  { name: '粮油米面', icon: 'i-heroicons-cube', color: 'text-yellow-600' },
  { name: '肉禽蛋品', icon: 'i-heroicons-heart', color: 'text-red-500' },
  { name: '水产海鲜', icon: 'i-heroicons-beaker', color: 'text-blue-500' },
  { name: '干货特产', icon: 'i-heroicons-gift', color: 'text-amber-600' }
]

useSeoMeta({
  title: '农优选 - 新鲜农产品直达餐桌',
  description: '农优选是一个连接农户与消费者的农产品电商平台，提供新鲜、优质的农产品直供服务。'
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-linear-to-r from-primary-600 to-primary-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            新鲜农产品，从田间直达餐桌
          </h1>
          <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            连接千万农户与消费者，提供优质、新鲜、健康的农产品直供服务
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton to="/products" size="xl" color="neutral" variant="solid">
              立即选购
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" />
              </template>
            </UButton>
            <UButton to="/seller/apply" size="xl" variant="outline" class="text-white border-white hover:bg-white/10">
              入驻开店
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- 分类导航 -->
    <section class="py-12 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-3 md:grid-cols-6 gap-6">
          <NuxtLink
            v-for="category in categories"
            :key="category.name"
            :to="`/products?category=${encodeURIComponent(category.name)}`"
            class="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
              <UIcon :name="category.icon" :class="['w-8 h-8', category.color]" />
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ category.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 热门商品 -->
    <section class="py-12 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">热门商品</h2>
          <UButton to="/products" variant="ghost" color="primary">
            查看更多
            <template #trailing>
              <UIcon name="i-heroicons-arrow-right" />
            </template>
          </UButton>
        </div>

        <div v-if="productsStatus === 'pending'" class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="animate-pulse">
            <div class="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square mb-4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>

        <div v-else-if="products.length" class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>

        <div v-else class="text-center py-12 text-gray-500">
          暂无商品
        </div>
      </div>
    </section>

    <!-- 推荐店铺 -->
    <section class="py-12 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">优质店铺</h2>
          <UButton to="/shops" variant="ghost" color="primary">
            查看更多
            <template #trailing>
              <UIcon name="i-heroicons-arrow-right" />
            </template>
          </UButton>
        </div>

        <div v-if="shopsStatus === 'pending'" class="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="animate-pulse">
            <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
          </div>
        </div>

        <div v-else-if="shops.length" class="grid grid-cols-2 md:grid-cols-3 gap-6">
          <ShopCard v-for="shop in shops" :key="shop.id" :shop="shop" />
        </div>

        <div v-else class="text-center py-12 text-gray-500">
          暂无店铺
        </div>
      </div>
    </section>

    <!-- 平台优势 -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">为什么选择农优选</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-truck" class="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">产地直发</h3>
            <p class="text-gray-600 dark:text-gray-400">从农户直接发货，减少中间环节，保证新鲜度</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-shield-check" class="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">品质保障</h3>
            <p class="text-gray-600 dark:text-gray-400">严格把控产品质量，每一件商品都经过精心挑选</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-currency-yen" class="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">价格实惠</h3>
            <p class="text-gray-600 dark:text-gray-400">去除中间商赚差价，让利于农户和消费者</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
