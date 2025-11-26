export type ShopStatus = 'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'

export type ApiResponse<T = unknown> = {
  code: number
  message: string
  data: T
}

export type ApiListResponse<T> = ApiResponse<T[]>

export interface DetailResponse {
  id: number
  name: string
  description?: string | null
  logoUrl?: string | null
  status: ShopStatus
  createdAt: string
  updatedAt: string
  productCount: number
  pendingOrderCount: number
  completedOrderCount: number
}

export interface Detail {
  id: number
  name: string
  description?: string | null
  price: number
  stock: number
  category?: string | null
  origin?: string | null
  sales: number
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
  shopId: number
  shopName: string
}

export interface ShipRequest {
  logisticsProvider?: string | null
  trackingNumber?: string | null
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
}

export interface ShopOrderDetail {
  id: number
  shopId: number
  shopName: string
  status: string
  totalAmount: number
  createdAt: string
  shippingAddress: string
  updatedAt: string
  logisticsProvider?: string | null
  trackingNumber?: string | null
  shippedAt?: string | null
  items: OrderItem[]
}

export interface ShopOrderSummary {
  id: number
  shopId: number
  shopName: string
  status: string
  totalAmount: number
  createdAt: string
  shippingAddress: string
}

export interface OrderDetail {
  id: number
  status: string
  totalAmount: number
  createdAt: string
  updatedAt: string
  shippingAddress: string
  shopOrders: ShopOrderSummary[]
  buyerId: number
  buyerUsername: string
}

export interface UpdateProfileRequest {
  nickname?: string | null
  avatarUrl?: string | null
  email?: string | null
  phone?: string | null
  bio?: string | null
}

export interface ProfileResponse {
  id: number
  username: string
  nickname?: string | null
  avatarUrl?: string | null
  email?: string | null
  phone?: string | null
  bio?: string | null
  roles: string[]
  createdAt: string
  updatedAt: string
}

export interface UpdateItemRequest {
  quantity: number
}

export interface Item {
  productId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
  stock: number
}

export interface ShopCart {
  shopId: number
  shopName: string
  items: Item[]
  subtotal: number
}

export interface CartDetail {
  shops: ShopCart[]
  totalItems: number
  totalAmount: number
}

export interface CreateRequest {
  name: string
  description?: string | null
  logoUrl?: string | null
}

export type UpdateRequest = CreateRequest

export interface CreateOrderRequest {
  items: Item[]
  shippingAddress?: string | null
}

export interface CreateAddressRequest {
  recipientName: string
  phone: string
  province: string
  city: string
  district: string
  street: string
  postalCode?: string | null
  isDefault?: boolean
}

export interface AddressResponse {
  id: number
  recipientName: string
  phone: string
  province: string
  city: string
  district: string
  street: string
  postalCode?: string | null
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

export interface AddItemRequest {
  productId: number
  quantity: number
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  username: string
  roles: string[]
}

export interface PublicSummary {
  id: number
  name: string
  description?: string | null
  logoUrl?: string | null
  createdAt: string
  productCount: number
}

export interface PublicDetail {
  shop: PublicSummary
  products: ProductSummary[]
}

export interface ProductSummary {
  id: number
  name: string
  description?: string | null
  price: number
  stock: number
  category?: string | null
  origin?: string | null
  sales: number
  publishedAt?: string | null
}

export interface PageMeta<T> {
  items: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export interface OrderSummary {
  id: number
  status: string
  totalAmount: number
  createdAt: string
  updatedAt: string
  shippingAddress: string
  shopOrders: ShopOrderSummary[]
}

export type PageResultPublicSummary = PageMeta<PublicSummary>
export type PageResultShopOrderSummary = PageMeta<ShopOrderSummary>
export type PageResultOrderSummary = PageMeta<OrderSummary>

export interface ApiMapResponse<T = unknown> extends ApiResponse<Record<string, T>> {}
export type UpdateShopRequest = CreateRequest
