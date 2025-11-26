<script setup lang="ts">
import { useProductsApi } from '~/services/api'
import type { ProductSummary } from '~/types/api'

const route = useRoute()
const productsApi = useProductsApi()

// 搜索参数
const keyword = ref((route.query.keyword as string) || '')
const category = ref((route.query.category as string) || '')
const priceMin = ref<number | undefined>(undefined)
const priceMax = ref<number | undefined>(undefined)
const sortBy = ref('sales,desc')
const page = ref(0)
const size = ref(20)

// 分类选项
const categories = [
  '全部',
  '新鲜蔬菜',
  '时令水果',
  '粮油米面',
  '肉禽蛋品',
  '水产海鲜',
  '干货特产'
]

// 排序选项
const sortOptions = [
  { label: '销量最高', value: 'sales,desc' },
  { label: '价格从低到高', value: 'price,asc' },
  { label: '价格从高到低', value: 'price,desc' },
  { label: '最新上架', value: 'publishedAt,desc' }
]

// 构建查询参数
const queryParams = computed(() => ({
  page: page.value,
  size: size.value,
  sort: [sortBy.value],
  category: category.value && category.value !== '全部' ? category.value : undefined,
  price_min: priceMin.value,
  price_max: priceMax.value,
  keyword: keyword.value || undefined
}))

// 获取商品列表
const { data, status, refresh } = await useAsyncData(
  'products-list',
  () => keyword.value
    ? productsApi.searchProducts({ q: keyword.value, ...queryParams.value })
    : productsApi.listProducts(queryParams.value),
  { watch: [queryParams] }
)

const products = computed<ProductSummary[]>(() => (data.value as any)?.items ?? [])
const totalElements = computed(() => (data.value as any)?.totalElements ?? 0)
const totalPages = computed(() => (data.value as any)?.totalPages ?? 0)

// 搜索处理
const handleSearch = () => {
  page.value = 0
  refresh()
}

// 分类切换
const handleCategoryChange = (cat: string) => {
  category.value = cat === '全部' ? '' : cat
  page.value = 0
}

// 分页处理
const handlePageChange = (newPage: number) => {
  page.value = newPage - 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

useSeoMeta({
  title: computed(() => {
    if (keyword.value) return `搜索"${keyword.value}" - 农优选`
    if (category.value) return `${category.value} - 农优选`
    return '全部商品 - 农优选'
  }),
  description: '浏览农优选平台上的优质农产品'
})
</script>

<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <div class="mb-8">
      <div class="flex gap-4">
        <UInput
          v-model="keyword"
          placeholder="搜索商品名称、分类、产地..."
          icon="i-heroicons-magnifying-glass"
          size="lg"
          class="flex-1"
          @keyup.enter="handleSearch"
        />
        <UButton size="lg" @click="handleSearch">搜索</UButton>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm">
      <!-- 分类 -->
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <span class="text-sm text-gray-500 dark:text-gray-400 mr-2">分类:</span>
        <UButton
          v-for="cat in categories"
          :key="cat"
          :variant="(category === '' && cat === '全部') || category === cat ? 'solid' : 'ghost'"
          :color="(category === '' && cat === '全部') || category === cat ? 'primary' : 'neutral'"
          size="sm"
          @click="handleCategoryChange(cat)"
        >
          {{ cat }}
        </UButton>
      </div>

      <!-- 价格和排序 -->
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">价格:</span>
          <UInput v-model.number="priceMin" type="number" placeholder="最低" size="sm" class="w-24" />
          <span class="text-gray-400">-</span>
          <UInput v-model.number="priceMax" type="number" placeholder="最高" size="sm" class="w-24" />
        </div>

        <div class="flex items-center gap-2 ml-auto">
          <span class="text-sm text-gray-500 dark:text-gray-400">排序:</span>
          <USelect v-model="sortBy" :options="sortOptions" size="sm" class="w-40" />
        </div>
      </div>
    </div>

    <!-- 结果统计 -->
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        共找到 <span class="font-semibold text-gray-900 dark:text-white">{{ totalElements }}</span> 件商品
      </p>
    </div>

    <!-- 商品列表 -->
    <div v-if="status === 'pending'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <div v-for="i in 10" :key="i" class="animate-pulse">
        <div class="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square mb-4"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>

    <div v-else-if="products.length" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>

    <div v-else class="text-center py-16">
      <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">暂无符合条件的商品</p>
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
