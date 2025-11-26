import type { LoginRequest, RegisterRequest, UserInfo } from '~/types/api'
import { useApi } from '~/composables/useApi'

export const useAuthApi = () => {
  const api = useApi()

  const login = (payload: LoginRequest) => api.post<UserInfo>('/api/v1/auth/login', payload)

  const register = (payload: RegisterRequest) => api.post<UserInfo>('/api/v1/auth/register', payload)

  const me = () => api.get<UserInfo>('/api/v1/auth/me')

  const logout = () => api.post<void>('/api/v1/auth/logout')

  return { login, register, me, logout }
}
