import type { DetailResponse, ShopStatus } from '../../types/api'
import { useApi } from '../../composables/useApi'

interface ListQuery {
  status?: ShopStatus
}

export const useAdminShopApi = () => {
  const api = useApi()

  const listByStatus = (query?: ListQuery) => api.get<DetailResponse[]>('/api/v1/admin/shops', query)

  const approve = (shopId: number) => api.put<DetailResponse>(`/api/v1/admin/shops/${shopId}/approve`)

  const reject = (shopId: number) => api.put<DetailResponse>(`/api/v1/admin/shops/${shopId}/reject`)

  const suspend = (shopId: number) => api.put<DetailResponse>(`/api/v1/admin/shops/${shopId}/suspend`)

  return { listByStatus, approve, reject, suspend }
}
