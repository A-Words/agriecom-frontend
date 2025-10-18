import type {
  AddressResponse,
  CreateAddressRequest,
  ProfileResponse,
  UpdateProfileRequest
} from '../../types/api'
import { useApi } from '../../composables/useApi'

export const useUserApi = () => {
  const api = useApi()

  const getProfile = () => api.get<ProfileResponse>('/api/v1/me/profile')

  const updateProfile = (payload: UpdateProfileRequest) =>
    api.put<ProfileResponse>('/api/v1/me/profile', payload)

  const listAddresses = () => api.get<AddressResponse[]>('/api/v1/me/addresses')

  const createAddress = (payload: CreateAddressRequest) =>
    api.post<AddressResponse>('/api/v1/me/addresses', payload)

  return { getProfile, updateProfile, listAddresses, createAddress }
}
