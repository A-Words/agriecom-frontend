import type {
  AddressResponse,
  CreateAddressRequest,
  ProfileResponse,
  UpdateProfileRequest
} from '~/types/api'
import { useApi } from '~/composables/useApi'

export const useUserApi = () => {
  const api = useApi()

  const getProfile = () => api.get<ProfileResponse>('/api/v1/me/profile')

  const updateProfile = (payload: UpdateProfileRequest) =>
    api.put<ProfileResponse>('/api/v1/me/profile', payload)

  const listAddresses = () => api.get<AddressResponse[]>('/api/v1/me/addresses')

  const createAddress = (payload: CreateAddressRequest) =>
    api.post<AddressResponse>('/api/v1/me/addresses', payload)

  const updateAddress = (id: number, payload: CreateAddressRequest) =>
    api.put<AddressResponse>(`/api/v1/me/addresses/${id}`, payload)

  const deleteAddress = (id: number) => api.delete<void>(`/api/v1/me/addresses/${id}`)

  const setDefaultAddress = (id: number) =>
    api.put<AddressResponse>(`/api/v1/me/addresses/${id}/default`)

  return { getProfile, updateProfile, listAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress }
}
