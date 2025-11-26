<script setup lang="ts">
import type { PublicSummary } from '~/types/api'

const props = defineProps<{
  shop: PublicSummary
}>()

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<template>
  <NuxtLink
    :to="`/shops/${shop.id}`"
    class="block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
  >
    <div class="p-6">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          <img
            v-if="shop.logoUrl"
            :src="shop.logoUrl"
            :alt="shop.name"
            class="w-full h-full object-cover"
          />
          <UIcon v-else name="i-heroicons-building-storefront" class="w-8 h-8 text-gray-400" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {{ shop.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ shop.productCount }} 件商品
          </p>
        </div>
      </div>

      <p v-if="shop.description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
        {{ shop.description }}
      </p>

      <div class="flex items-center justify-between text-xs text-gray-400">
        <span>入驻时间: {{ formatDate(shop.createdAt) }}</span>
        <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
      </div>
    </div>
  </NuxtLink>
</template>
