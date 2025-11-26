import type {
  CreateRequest,
  DetailResponse,
  PageMeta,
  PublicDetail,
  PublicSummary,
  UpdateRequest
} from '~/types/api'
import { useApi } from '~/composables/useApi'

interface ShopListQuery {
  page?: number
  size?: number
  keyword?: string
}

export const useShopApi = () => {
  const api = useApi()

  const getMyShop = () => api.get<DetailResponse>('/api/v1/my-shop')

  const updateMyShop = (payload: UpdateRequest) => api.put<DetailResponse>('/api/v1/my-shop', payload)

  const applyShop = (payload: CreateRequest) => api.post<DetailResponse>('/api/v1/shops', payload)

  const listShops = (query?: ShopListQuery) => api.get<PageMeta<PublicSummary>>('/api/v1/shops', query)

  const getShop = (shopId: number) => api.get<PublicDetail>(`/api/v1/shops/${shopId}`)

  return {
    getMyShop,
    updateMyShop,
    applyShop,
    listShops,
    getShop
  }
}
