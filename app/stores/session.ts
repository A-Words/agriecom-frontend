import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { LoginRequest, ProfileResponse, RegisterRequest, UserInfo } from '~/types/api'
import { useAuthApi, useUserApi } from '~/services/api'

export const useSessionStore = defineStore('session', () => {
  const authUser = ref<UserInfo | null>(null)
  const profile = ref<ProfileResponse | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const authApi = useAuthApi()
  const userApi = useUserApi()

  const isAuthenticated = computed(() => Boolean(authUser.value))

  const setError = (err: unknown) => {
    if (err instanceof Error) {
      errorMessage.value = err.message
      return
    }
    errorMessage.value = '未知错误'
  }

  const clearError = () => {
    errorMessage.value = null
  }

  const fetchCurrentUser = async () => {
    try {
      clearError()
      loading.value = true
      authUser.value = await authApi.me()
    } catch (err) {
      authUser.value = null
      setError(err)
    } finally {
      loading.value = false
    }
  }

  const fetchProfile = async () => {
    try {
      clearError()
      loading.value = true
      profile.value = await userApi.getProfile()
    } catch (err) {
      profile.value = null
      setError(err)
    } finally {
      loading.value = false
    }
  }

  const login = async (payload: LoginRequest) => {
    try {
      clearError()
      loading.value = true
      authUser.value = await authApi.login(payload)
      await fetchProfile()
    } catch (err) {
      authUser.value = null
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (payload: RegisterRequest) => {
    try {
      clearError()
      loading.value = true
      authUser.value = await authApi.register(payload)
      await fetchProfile()
    } catch (err) {
      authUser.value = null
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      clearError()
      loading.value = true
      await authApi.logout()
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
      reset()
    }
  }

  const reset = () => {
    authUser.value = null
    profile.value = null
  }

  return {
    authUser,
    profile,
    loading,
    errorMessage,
    isAuthenticated,
    clearError,
    fetchCurrentUser,
    fetchProfile,
    login,
    register,
    logout,
    reset
  }
})
