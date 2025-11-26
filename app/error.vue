<script setup lang="ts">
const error = useError()
const router = useRouter()

const handleError = () => {
  clearError({
    redirect: '/'
  })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="mb-8">
        <span class="text-8xl font-bold text-primary-600">{{ error?.statusCode || 500 }}</span>
      </div>

      <h1 class="text-2xl font-semibold text-gray-800 mb-4">
        {{ error?.statusCode === 404 ? '页面不存在' : '出错了' }}
      </h1>

      <p class="text-gray-600 mb-8 max-w-md">
        {{ error?.statusCode === 404
          ? '抱歉，您访问的页面不存在或已被移动。'
          : error?.message || '服务器发生了错误，请稍后重试。'
        }}
      </p>

      <div class="flex justify-center gap-4">
        <UButton @click="router.back()" variant="outline" size="lg">
          返回上页
        </UButton>
        <UButton @click="handleError" size="lg">
          返回首页
        </UButton>
      </div>
    </div>
  </div>
</template>
