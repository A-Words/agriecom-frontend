<script setup lang="ts">
import { useShopApi } from '~/services/api'
import type { PublicSummary, PageMeta } from '~/types/api'

const shopApi = useShopApi()

const keyword = ref('')
const page = ref(0)
const size = ref(12)

const queryParams = computed(() => ({
  page: page.value,
  size: size.value,
  keyword: keyword.value || undefined
}))

const { data, status, refresh } = await useAsyncData<PageMeta<PublicSummary>>(
  'shops-list',
  () => shopApi.listShops(queryParams.value),
  { watch: [queryParams] }
)

const shops = computed<PublicSummary[]>(() => data.value?.items ?? [])
const totalElements = computed(() => data.value?.totalElements ?? 0)
const totalPages = computed(() => data.value?.totalPages ?? 0)

const handleSearch = () => {
  page.value = 0
  refresh()
}

const handlePageChange = (newPage: number) => {
  page.value = newPage - 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

useSeoMeta({
  title: '店铺列表 - 农优选',
  description: '浏览农优选平台上的优质农产品店铺'
})
</script>

<template>
  <div class="page-container">
    <h1 class="section-title">店铺列表</h1>

    <!-- 搜索 -->
    <div class="mb-8">
      <div class="flex gap-4 max-w-md">
        <UInput
          v-model="keyword"
          placeholder="搜索店铺名称..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
          @keyup.enter="handleSearch"
        />
        <UButton @click="handleSearch">搜索</UButton>
      </div>
    </div>

    <!-- 结果统计 -->
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      共 <span class="font-semibold text-gray-900 dark:text-white">{{ totalElements }}</span> 家店铺
    </p>

    <!-- 店铺列表 -->
    <div v-if="status === 'pending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="animate-pulse">
        <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-40"></div>
      </div>
    </div>

    <div v-else-if="shops.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ShopCard v-for="shop in shops" :key="shop.id" :shop="shop" />
    </div>

    <div v-else class="text-center py-16">
      <UIcon name="i-heroicons-building-storefront" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">暂无店铺</p>
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
