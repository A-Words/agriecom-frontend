import type {
  CreateRequest,
  Detail,
  PageResultPublicSummary,
  UpdateRequest
} from '../../types/api'
import { useApi } from '../../composables/useApi'

interface ProductQuery {
  page?: number
  size?: number
  sort?: string[]
  category?: string
  origin?: string
  price_min?: number
  price_max?: number
  shop_id?: number
  keyword?: string
  include_inactive_shop?: boolean
}

interface SearchQuery extends Omit<ProductQuery, 'keyword' | 'include_inactive_shop'> {
  q: string
}

export const useProductsApi = () => {
  const api = useApi()

  const listProducts = (query?: ProductQuery) => api.get<PageResultPublicSummary>('/api/v1/products', query)

  const getProductDetail = (productId: number) => api.get<Detail>(`/api/v1/products/${productId}`)

  const searchProducts = (query: SearchQuery) => api.get<PageResultPublicSummary>('/api/v1/products/search', query)

  const listMyProducts = () => api.get<Detail[]>('/api/v1/my-shop/products')

  const createProduct = (payload: CreateRequest) => api.post<Detail>('/api/v1/my-shop/products', payload)

  const updateProduct = (productId: number, payload: UpdateRequest) =>
    api.put<Detail>(`/api/v1/my-shop/products/${productId}`, payload)

  const deleteProduct = (productId: number) => api.delete<void>(`/api/v1/my-shop/products/${productId}`)

  return {
    listProducts,
    getProductDetail,
    searchProducts,
    listMyProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
}
