import { api } from './api'
import type { ApiOrderStatus, ApiPaymentMethod, OrderDto, PageResponse, PaymentDto } from '../types/api'

export async function createOrder(payload: { customerName: string; items: { menuItemId: string; quantity: number }[] }) {
  return (await api.post<OrderDto>('/api/orders', payload)).data
}

export async function listMyOrders(page = 0, size = 25) {
  return (await api.get<PageResponse<OrderDto>>('/api/orders/my-orders', { params: { page, size } })).data
}

export async function listOrders(params: { status?: ApiOrderStatus; from?: string; to?: string; page?: number; size?: number } = {}) {
  return (await api.get<PageResponse<OrderDto>>('/api/orders', { params })).data
}

export async function getOrder(id: string) {
  return (await api.get<OrderDto>(`/api/orders/${id}`)).data
}

export async function listKitchenOrders(status?: Extract<ApiOrderStatus, 'RECEIVED' | 'PREPARING' | 'READY'>) {
  return (await api.get<OrderDto[]>('/api/kitchen/orders', { params: status ? { status } : {} })).data
}

export async function updateKitchenOrder(id: string, status: 'PREPARING' | 'READY') {
  return (await api.patch<OrderDto>(`/api/kitchen/orders/${id}/status`, { status })).data
}

export async function listWaiterOrders(status?: Extract<ApiOrderStatus, 'READY' | 'SERVED'>) {
  return (await api.get<OrderDto[]>('/api/waiter/orders', { params: status ? { status } : {} })).data
}

export async function serveOrder(id: string) {
  return (await api.patch<OrderDto>(`/api/waiter/orders/${id}/serve`)).data
}

export async function listPendingCashierOrders() {
  return (await api.get<OrderDto[]>('/api/cashier/orders/pending')).data
}

export async function recordSimulatedPayment(id: string, method: ApiPaymentMethod) {
  return (await api.post<PaymentDto>(`/api/cashier/orders/${id}/payments`, { method })).data
}

export async function listPayments(page = 0, size = 25) {
  return (await api.get<PageResponse<PaymentDto>>('/api/cashier/payments', { params: { page, size } })).data
}