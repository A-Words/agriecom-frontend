<script setup lang="ts">
import type { ProductSummary } from '~/types/api'
import { useCartStore } from '~/stores/cart'
import { useSessionStore } from '~/stores/session'

const props = defineProps<{
  product: ProductSummary
}>()

const cartStore = useCartStore()
const sessionStore = useSessionStore()
const toast = useToast()

const adding = ref(false)

const formatPrice = (price: number) => {
  return `¥${price.toFixed(2)}`
}

const handleAddToCart = async () => {
  if (!sessionStore.isAuthenticated) {
    toast.add({ title: '请先登录', color: 'warning' })
    navigateTo('/auth/login')
    return
  }

  if (props.product.stock <= 0) {
    toast.add({ title: '商品已售罄', color: 'error' })
    return
  }

  try {
    adding.value = true
    await cartStore.addItem({
      productId: props.product.id,
      quantity: 1
    })
    toast.add({ title: '已加入购物车', color: 'success' })
  } catch {
    toast.add({ title: '添加失败', color: 'error' })
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <div class="product-card bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
    <NuxtLink :to="`/products/${product.id}`" class="block">
      <div class="aspect-square bg-gray-100 dark:bg-gray-700 relative">
        <img
          v-if="product.description?.startsWith('http')"
          :src="product.description"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
        </div>
        <div v-if="product.stock <= 0" class="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span class="text-white font-bold">已售罄</span>
        </div>
      </div>
    </NuxtLink>

    <div class="p-4">
      <NuxtLink :to="`/products/${product.id}`">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 hover:text-primary-600">
          {{ product.name }}
        </h3>
      </NuxtLink>

      <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span v-if="product.category" class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
          {{ product.category }}
        </span>
        <span v-if="product.origin">{{ product.origin }}</span>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
            {{ formatPrice(product.price) }}
          </span>
          <span class="text-xs text-gray-400 ml-2">
            销量 {{ product.sales }}
          </span>
        </div>

        <UButton
          icon="i-heroicons-shopping-cart"
          size="xs"
          :loading="adding"
          :disabled="product.stock <= 0"
          @click.prevent="handleAddToCart"
        />
      </div>
    </div>
  </div>
</template>
