import type { ApiMapResponse } from '~/types/api'
import { useApi } from '~/composables/useApi'

export const useSystemApi = () => {
  const api = useApi()

  const health = () => api.get<Record<string, unknown>>('/api/v1/health')

  const connectivity = () => api.get<ApiMapResponse['data']>('/api/v1/connectivity')

  return { health, connectivity }
}
