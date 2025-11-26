import { useSessionStore } from '~/stores/session'

export default defineNuxtRouteMiddleware((to) => {
  const sessionStore = useSessionStore()

  // 不需要认证的页面
  const publicPages = ['/', '/products', '/shops', '/auth/login', '/auth/register']
  const isPublicPage = publicPages.some(path =>
    to.path === path || to.path.startsWith('/products/') || to.path.startsWith('/shops/')
  )

  if (isPublicPage) {
    return
  }

  // 需要登录
  if (!sessionStore.isAuthenticated) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // 商户页面需要SELLER角色
  if (to.path.startsWith('/seller')) {
    if (!sessionStore.authUser?.roles?.includes('SELLER')) {
      return navigateTo('/seller/apply')
    }
  }

  // 管理员页面需要ADMIN角色
  if (to.path.startsWith('/admin')) {
    if (!sessionStore.authUser?.roles?.includes('ADMIN')) {
      return navigateTo('/')
    }
  }
})
