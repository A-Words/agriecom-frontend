<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useCartStore } from '~/stores/cart'

const sessionStore = useSessionStore()
const cartStore = useCartStore()
const colorMode = useColorMode()
const toast = useToast()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val) => {
    colorMode.preference = val ? 'dark' : 'light'
  }
})

// 初始化：获取当前用户和购物车
onMounted(async () => {
  await sessionStore.fetchCurrentUser()
  if (sessionStore.isAuthenticated) {
    await Promise.all([
      sessionStore.fetchProfile(),
      cartStore.fetchCart()
    ])
  }
})

// 用户菜单项
const userMenuItems = computed(() => {
  if (!sessionStore.isAuthenticated) {
    return [[
      { label: '登录', icon: 'i-heroicons-arrow-right-on-rectangle', to: '/auth/login' },
      { label: '注册', icon: 'i-heroicons-user-plus', to: '/auth/register' }
    ]]
  }

  const items: any[][] = [
    [
      { label: sessionStore.profile?.nickname || sessionStore.authUser?.username || '用户', slot: 'account', disabled: true }
    ],
    [
      { label: '个人中心', icon: 'i-heroicons-user-circle', to: '/user/profile' },
      { label: '我的订单', icon: 'i-heroicons-clipboard-document-list', to: '/user/orders' },
      { label: '收货地址', icon: 'i-heroicons-map-pin', to: '/user/addresses' }
    ]
  ]

  // 商户功能
  if (sessionStore.authUser?.roles?.includes('SELLER')) {
    items.push([
      { label: '我的店铺', icon: 'i-heroicons-building-storefront', to: '/seller/shop' },
      { label: '商品管理', icon: 'i-heroicons-cube', to: '/seller/products' },
      { label: '订单管理', icon: 'i-heroicons-truck', to: '/seller/orders' }
    ])
  }

  // 管理员功能
  if (sessionStore.authUser?.roles?.includes('ADMIN')) {
    items.push([
      { label: '店铺审核', icon: 'i-heroicons-shield-check', to: '/admin/shops' }
    ])
  }

  items.push([
    { label: '退出登录', icon: 'i-heroicons-arrow-left-on-rectangle', onSelect: handleLogout }
  ])

  return items
})

const handleLogout = async () => {
  try {
    await sessionStore.logout()
    cartStore.reset()
    toast.add({ title: '已退出登录', color: 'success' })
    navigateTo('/')
  } catch {
    toast.add({ title: '退出失败', color: 'error' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航 -->
    <header class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2">
            <UIcon name="i-heroicons-leaf" class="w-8 h-8 text-primary-600" />
            <span class="text-xl font-bold text-gray-900 dark:text-white">农优选</span>
          </NuxtLink>

          <!-- 导航链接 -->
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink to="/" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              首页
            </NuxtLink>
            <NuxtLink to="/products" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              全部商品
            </NuxtLink>
            <NuxtLink to="/shops" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              店铺
            </NuxtLink>
          </nav>

          <!-- 右侧操作区 -->
          <div class="flex items-center gap-4">
            <!-- 搜索 -->
            <UButton
              icon="i-heroicons-magnifying-glass"
              variant="ghost"
              color="neutral"
              to="/products"
            />

            <!-- 购物车 -->
            <UButton
              icon="i-heroicons-shopping-cart"
              variant="ghost"
              color="neutral"
              to="/cart"
              class="relative"
            >
              <template #trailing>
                <UBadge
                  v-if="cartStore.totalItems > 0"
                  :label="cartStore.totalItems > 99 ? '99+' : String(cartStore.totalItems)"
                  color="error"
                  size="xs"
                  class="absolute -top-1 -right-1"
                />
              </template>
            </UButton>

            <!-- 主题切换 -->
            <UButton
              :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
              variant="ghost"
              color="neutral"
              @click="isDark = !isDark"
            />

            <!-- 用户菜单 -->
            <UDropdownMenu :items="userMenuItems">
              <UButton
                :icon="sessionStore.isAuthenticated ? 'i-heroicons-user-circle-solid' : 'i-heroicons-user-circle'"
                variant="ghost"
                color="neutral"
              />
            </UDropdownMenu>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main>
      <slot />
    </main>

    <!-- 底部 -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- 关于我们 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">关于农优选</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              农优选是一个连接农户与消费者的农产品电商平台，致力于为您提供新鲜、优质的农产品直供服务。
            </p>
          </div>

          <!-- 快速链接 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速链接</h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/products" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">
                  全部商品
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/shops" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">
                  店铺列表
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/seller/apply" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">
                  入驻开店
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- 帮助中心 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">帮助中心</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">购物指南</a>
              </li>
              <li>
                <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">配送说明</a>
              </li>
              <li>
                <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">售后服务</a>
              </li>
            </ul>
          </div>

          <!-- 联系方式 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">联系我们</h3>
            <ul class="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-phone" class="w-4 h-4" />
                400-123-4567
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
                support@agriecom.com
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          © 2025 农优选. All rights reserved.
        </div>
      </div>
    </footer>

    <!-- 全局通知 -->
    <UNotifications />
  </div>
</template>
