<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useProductsApi } from '~/services/api'
import type { CreateRequest, Detail, UpdateRequest } from '~/types/api'

const sessionStore = useSessionStore()
const productsApi = useProductsApi()
const toast = useToast()

onMounted(() => {
  if (!sessionStore.isAuthenticated) {
    toast.add({ title: '请先登录', color: 'warning' })
    navigateTo('/auth/login')
    return
  }

  if (!sessionStore.authUser?.roles?.includes('SELLER')) {
    toast.add({ title: '您还不是商户', color: 'warning' })
    navigateTo('/seller/apply')
  }
})

const { data: products, status, refresh } = await useAsyncData<Detail[]>(
  'my-products',
  () => productsApi.listMyProducts()
)

const showModal = ref(false)
const editingProduct = ref<Detail | null>(null)
const saving = ref(false)
const deleting = ref<number | null>(null)

const form = reactive<CreateRequest & { price?: number; stock?: number; category?: string; origin?: string }>({
  name: '',
  description: '',
  logoUrl: ''
})

const resetForm = () => {
  editingProduct.value = null
  Object.assign(form, {
    name: '',
    description: '',
    logoUrl: '',
    price: undefined,
    stock: undefined,
    category: '',
    origin: ''
  })
}

const handleAdd = () => {
  resetForm()
  showModal.value = true
}

const handleEdit = (product: Detail) => {
  editingProduct.value = product
  Object.assign(form, {
    name: product.name,
    description: product.description || '',
    logoUrl: '',
    price: product.price,
    stock: product.stock,
    category: product.category || '',
    origin: product.origin || ''
  })
  showModal.value = true
}

const handleSave = async () => {
  if (!form.name) {
    toast.add({ title: '请输入商品名称', color: 'warning' })
    return
  }

  try {
    saving.value = true

    if (editingProduct.value) {
      await productsApi.updateProduct(editingProduct.value.id, form as UpdateRequest)
      toast.add({ title: '商品更新成功', color: 'success' })
    } else {
      await productsApi.createProduct(form)
      toast.add({ title: '商品创建成功', color: 'success' })
    }

    await refresh()
    showModal.value = false
  } catch (err: any) {
    toast.add({ title: err.message || '操作失败', color: 'error' })
  } finally {
    saving.value = false
  }
}

const handleDelete = async (productId: number) => {
  if (!confirm('确定要删除该商品吗？')) return

  try {
    deleting.value = productId
    await productsApi.deleteProduct(productId)
    await refresh()
    toast.add({ title: '商品已删除', color: 'success' })
  } catch (err: any) {
    toast.add({ title: err.message || '删除失败', color: 'error' })
  } finally {
    deleting.value = null
  }
}

const formatPrice = (price: number) => `¥${price.toFixed(2)}`
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('zh-CN')

useSeoMeta({
  title: '商品管理 - 农优选'
})
</script>

<template>
  <div class="page-container">
    <div class="flex items-center justify-between mb-6">
      <h1 class="section-title mb-0">商品管理</h1>
      <UButton @click="handleAdd">
        <UIcon name="i-heroicons-plus" class="mr-2" />
        新增商品
      </UButton>
    </div>

    <!-- 加载中 -->
    <div v-if="status === 'pending'" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
    </div>

    <!-- 商品列表 -->
    <div v-else-if="products?.length" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">商品信息</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">价格</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">库存</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">销量</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">创建时间</th>
            <th class="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ product.name }}</p>
                  <p class="text-sm text-gray-500">{{ product.category || '未分类' }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-4 text-primary-600 dark:text-primary-400 font-medium">
              {{ formatPrice(product.price) }}
            </td>
            <td class="px-4 py-4">
              <span :class="product.stock > 0 ? 'text-green-600' : 'text-red-500'">
                {{ product.stock }}
              </span>
            </td>
            <td class="px-4 py-4 text-gray-600 dark:text-gray-400">{{ product.sales }}</td>
            <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{{ formatDate(product.createdAt) }}</td>
            <td class="px-4 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <UButton variant="ghost" size="sm" @click="handleEdit(product)">编辑</UButton>
                <UButton
                  variant="ghost"
                  color="error"
                  size="sm"
                  :loading="deleting === product.id"
                  @click="handleDelete(product.id)"
                >
                  删除
                </UButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
      <UIcon name="i-heroicons-cube" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">暂无商品</p>
      <UButton @click="handleAdd">添加商品</UButton>
    </div>

    <!-- 商品编辑弹窗 -->
    <UModal v-model:open="showModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ editingProduct ? '编辑商品' : '新增商品' }}
          </h3>

          <form @submit.prevent="handleSave" class="space-y-4">
            <UFormField label="商品名称" required>
              <UInput v-model="form.name" placeholder="请输入商品名称" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="价格">
                <UInput v-model.number="form.price" type="number" step="0.01" placeholder="0.00" />
              </UFormField>
              <UFormField label="库存">
                <UInput v-model.number="form.stock" type="number" placeholder="0" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="分类">
                <UInput v-model="form.category" placeholder="如：新鲜蔬菜" />
              </UFormField>
              <UFormField label="产地">
                <UInput v-model="form.origin" placeholder="如：山东寿光" />
              </UFormField>
            </div>

            <UFormField label="商品描述">
              <UTextarea v-model="form.description" placeholder="请输入商品描述" :rows="3" />
            </UFormField>

            <div class="flex justify-end gap-3 pt-4">
              <UButton variant="ghost" type="button" @click="showModal = false">取消</UButton>
              <UButton type="submit" :loading="saving">保存</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>
