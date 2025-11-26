import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { AddItemRequest, CartDetail, UpdateItemRequest } from '~/types/api'
import { useCartApi } from '~/services/api'

export const useCartStore = defineStore('cart', () => {
  const cart = ref<CartDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const cartApi = useCartApi()

  const totalItems = computed(() => cart.value?.totalItems ?? 0)
  const totalAmount = computed(() => cart.value?.totalAmount ?? 0)
  const isEmpty = computed(() => totalItems.value === 0)

  const clearError = () => {
    error.value = null
  }

  const setError = (err: unknown) => {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = '操作失败'
    }
  }

  const fetchCart = async () => {
    try {
      clearError()
      loading.value = true
      cart.value = await cartApi.getCart()
    } catch (err) {
      setError(err)
    } finally {
      loading.value = false
    }
  }

  const addItem = async (payload: AddItemRequest) => {
    try {
      clearError()
      loading.value = true
      cart.value = await cartApi.addItem(payload)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateItem = async (productId: number, payload: UpdateItemRequest) => {
    try {
      clearError()
      loading.value = true
      cart.value = await cartApi.updateItem(productId, payload)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeItem = async (productId: number) => {
    try {
      clearError()
      loading.value = true
      cart.value = await cartApi.removeItem(productId)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearCart = async () => {
    try {
      clearError()
      loading.value = true
      cart.value = await cartApi.clear()
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    cart.value = null
    error.value = null
  }

  return {
    cart,
    loading,
    error,
    totalItems,
    totalAmount,
    isEmpty,
    clearError,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    reset
  }
})
