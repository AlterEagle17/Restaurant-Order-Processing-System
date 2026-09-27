import { api } from './api'
import type { ManagerDashboardDto, OrderDto, PageResponse, RevenueDto } from '../types/api'

export async function getManagerDashboard(from: string, to: string) {
  return (await api.get<ManagerDashboardDto>('/api/manager/dashboard', { params: { from, to } })).data
}

export async function getManagerRevenue(from: string, to: string) {
  return (await api.get<RevenueDto>('/api/manager/revenue', { params: { from, to } })).data
}

export async function listManagerOrders(params: { from?: string; to?: string; page?: number; size?: number } = {}) {
  return (await api.get<PageResponse<OrderDto>>('/api/manager/orders', { params })).data
}