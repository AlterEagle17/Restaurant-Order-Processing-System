import type { UserRole } from './auth'

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface UserSummary {
  id: string
  username: string
  displayName: string
  role: UserRole
  active: boolean
  tableAccount?: boolean
  tableNumber?: number | null
  createdAt: string
}

export interface MenuCategoryDto {
  id: string
  name: string
  description: string | null
  active: boolean
}

export interface MenuItemDto {
  id: string
  name: string
  description: string | null
  categoryId: string
  categoryName: string
  price: number
  imageUrl: string | null
  active: boolean
}

export type ApiOrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED'
export type ApiPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type ApiPaymentMethod = 'CASH' | 'CARD'

export interface OrderItemDto {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface OrderDto {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  tableNumber: number
  status: ApiOrderStatus
  paymentStatus: ApiPaymentStatus
  items: OrderItemDto[]
  total: number
  createdAt: string
}

export interface PaymentDto {
  id: string
  orderId: string
  orderNumber: string
  amount: number
  status: ApiPaymentStatus
  method: ApiPaymentMethod
  createdAt: string
}

export interface ManagerDashboardDto {
  date: string | null
  from: string
  to: string
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
}

export interface RevenuePointDto {
  date: string
  revenue: number
}

export interface RevenueDto {
  from: string
  to: string
  points: RevenuePointDto[]
}