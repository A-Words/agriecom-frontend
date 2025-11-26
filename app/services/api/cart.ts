import type {
  AddItemRequest,
  CartDetail,
  UpdateItemRequest
} from '~/types/api'
import { useApi } from '~/composables/useApi'

export const useCartApi = () => {
  const api = useApi()

  const getCart = () => api.get<CartDetail>('/api/v1/cart')

  const addItem = (payload: AddItemRequest) => api.post<CartDetail>('/api/v1/cart/items', payload)

  const updateItem = (productId: number, payload: UpdateItemRequest) =>
    api.put<CartDetail>(`/api/v1/cart/items/${productId}`, payload)

  const removeItem = (productId: number) => api.delete<CartDetail>(`/api/v1/cart/items/${productId}`)

  const clear = () => api.post<CartDetail>('/api/v1/cart/clear')

  return { getCart, addItem, updateItem, removeItem, clear }
}
