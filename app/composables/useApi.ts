import { $fetch } from 'ofetch'
import type { FetchContext, FetchOptions } from 'ofetch'

type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type JsonFetchOptions = FetchOptions<'json'>

type RequestOptions<T> = Omit<JsonFetchOptions, 'method'> & {
  method?: HttpMethod
  transform?: (data: ApiResponse<unknown>) => T
}

export interface ApiError extends Error {
  statusCode?: number
  statusMessage?: string
  payload?: ApiResponse<unknown> | null
}

const defaultHeaders = {
  Accept: 'application/json'
}

const unwrap = <T>(payload: ApiResponse<T>): T => {
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data
  }
  // 兼容偶发的非标准响应
  return payload as unknown as T
}

export function useApi() {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl as string | undefined

  const fetcher = $fetch.create({
    baseURL: apiBaseUrl ?? 'http://127.0.0.1:8080',
    credentials: 'include',
    headers: defaultHeaders,
    parseResponse: JSON.parse,
    onResponseError({ response }: FetchContext<ApiResponse<unknown>>) {
      const err: ApiError = new Error(response?._data?.message ?? '请求失败')
      err.statusCode = response?.status
      err.statusMessage = response?.statusText
      err.payload = response?._data ?? null
      throw err
    }
  })

  const request = async <T>(url: string, options: RequestOptions<T>) => {
    const { transform, ...rest } = options
    const payload = await fetcher<ApiResponse<T>>(url, rest as JsonFetchOptions)
    if (transform) {
      return transform(payload as ApiResponse<unknown>)
    }
    return unwrap(payload)
  }

  const get = <T>(url: string, query?: Record<string, any>, options: RequestOptions<T> = {}) =>
    request<T>(url, { ...options, method: 'GET', query })

  const post = <T>(url: string, body?: JsonFetchOptions['body'], options: RequestOptions<T> = {}) =>
    request<T>(url, { ...options, method: 'POST', body })

  const put = <T>(url: string, body?: JsonFetchOptions['body'], options: RequestOptions<T> = {}) =>
    request<T>(url, { ...options, method: 'PUT', body })

  const del = <T>(url: string, options: RequestOptions<T> = {}) =>
    request<T>(url, { ...options, method: 'DELETE' })

  return { get, post, put, delete: del, request }
}
