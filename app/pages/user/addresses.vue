<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useUserApi } from '~/services/api'
import type { AddressResponse, CreateAddressRequest } from '~/types/api'

const sessionStore = useSessionStore()
const userApi = useUserApi()
const toast = useToast()

onMounted(() => {
  if (!sessionStore.isAuthenticated) {
    toast.add({ title: '请先登录', color: 'warning' })
    navigateTo('/auth/login')
  }
})

const { data: addresses, status, refresh } = await useAsyncData<AddressResponse[]>(
  'my-addresses',
  () => userApi.listAddresses()
)

const showModal = ref(false)
const saving = ref(false)

const form = reactive<CreateAddressRequest>({
  recipientName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  street: '',
  postalCode: '',
  isDefault: false
})

const resetForm = () => {
  Object.assign(form, {
    recipientName: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    street: '',
    postalCode: '',
    isDefault: false
  })
}

const handleAdd = () => {
  resetForm()
  showModal.value = true
}

const handleSave = async () => {
  if (!form.recipientName || !form.phone || !form.province ||
      !form.city || !form.district || !form.street) {
    toast.add({ title: '请填写完整地址信息', color: 'warning' })
    return
  }

  try {
    saving.value = true
    await userApi.createAddress(form)
    await refresh()
    showModal.value = false
    toast.add({ title: '地址添加成功', color: 'success' })
  } catch (err: any) {
    toast.add({ title: err.message || '添加失败', color: 'error' })
  } finally {
    saving.value = false
  }
}

const formatAddress = (addr: AddressResponse) => {
  return `${addr.province} ${addr.city} ${addr.district} ${addr.street}`
}

useSeoMeta({
  title: '收货地址 - 农优选'
})
</script>

<template>
  <div class="page-container">
    <div class="flex items-center justify-between mb-6">
      <h1 class="section-title mb-0">收货地址</h1>
      <UButton @click="handleAdd">
        <UIcon name="i-heroicons-plus" class="mr-2" />
        新增地址
      </UButton>
    </div>

    <!-- 加载中 -->
    <div v-if="status === 'pending'" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
    </div>

    <!-- 地址列表 -->
    <div v-else-if="addresses?.length" class="space-y-4">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="font-medium text-gray-900 dark:text-white">{{ addr.recipientName }}</span>
              <span class="text-gray-600 dark:text-gray-400">{{ addr.phone }}</span>
              <UBadge v-if="addr.isDefault" color="primary" size="xs">默认</UBadge>
            </div>
            <p class="text-gray-600 dark:text-gray-400">{{ formatAddress(addr) }}</p>
            <p v-if="addr.postalCode" class="text-sm text-gray-400 mt-1">
              邮编: {{ addr.postalCode }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
      <UIcon name="i-heroicons-map-pin" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">暂无收货地址</p>
      <UButton @click="handleAdd">添加地址</UButton>
    </div>

    <!-- 新增地址弹窗 -->
    <UModal v-model:open="showModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">新增收货地址</h3>

          <form @submit.prevent="handleSave" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="收货人" required>
                <UInput v-model="form.recipientName" placeholder="请输入收货人姓名" />
              </UFormField>
              <UFormField label="手机号" required>
                <UInput v-model="form.phone" placeholder="请输入手机号" />
              </UFormField>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="省份" required>
                <UInput v-model="form.province" placeholder="省份" />
              </UFormField>
              <UFormField label="城市" required>
                <UInput v-model="form.city" placeholder="城市" />
              </UFormField>
              <UFormField label="区县" required>
                <UInput v-model="form.district" placeholder="区县" />
              </UFormField>
            </div>

            <UFormField label="详细地址" required>
              <UInput v-model="form.street" placeholder="请输入详细地址（街道、门牌号等）" />
            </UFormField>

            <UFormField label="邮政编码">
              <UInput v-model="form.postalCode" placeholder="邮政编码（选填）" />
            </UFormField>

            <UCheckbox v-model="form.isDefault" label="设为默认地址" />

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
