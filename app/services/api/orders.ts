import type {
  CreateOrderRequest,
  OrderDetail,
  PageResultOrderSummary,
  PageResultShopOrderSummary,
  ShipRequest,
  ShopOrderDetail
} from '~/types/api'
import { useApi } from '~/composables/useApi'

interface PaginationQuery {
  page?: number
  size?: number
}

export const useOrdersApi = () => {
  const api = useApi()

  const createOrder = (payload: CreateOrderRequest) => api.post<OrderDetail>('/api/v1/orders', payload)

  const listMyOrders = (query?: PaginationQuery) => api.get<PageResultOrderSummary>('/api/v1/my-orders', query)

  const getOrderDetail = (orderId: number) => api.get<OrderDetail>(`/api/v1/my-orders/${orderId}`)

  const cancelOrder = (orderId: number) => api.put<OrderDetail>(`/api/v1/my-orders/${orderId}/cancel`)

  const listShopOrders = (query?: PaginationQuery) => api.get<PageResultShopOrderSummary>('/api/v1/my-shop/orders', query)

  const getShopOrderDetail = (orderId: number) => api.get<ShopOrderDetail>(`/api/v1/my-shop/orders/${orderId}`)

  const shipOrder = (orderId: number, payload: ShipRequest) =>
    api.put<ShopOrderDetail>(`/api/v1/my-shop/orders/${orderId}/ship`, payload)

  return {
    createOrder,
    listMyOrders,
    getOrderDetail,
    cancelOrder,
    listShopOrders,
    getShopOrderDetail,
    shipOrder
  }
}
