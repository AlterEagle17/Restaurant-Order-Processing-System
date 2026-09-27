import { api } from './api'
import type { PageResponse, UserSummary } from '../types/api'
import type { UserRole } from '../types/auth'

export interface CreateUserPayload {
  username: string
  password: string
  displayName: string
  role: UserRole
}

export async function listUsers(params: { page?: number; size?: number; query?: string; role?: UserRole; active?: boolean } = {}) {
  return (await api.get<PageResponse<UserSummary>>('/api/admin/users', { params })).data
}

export async function createUser(payload: CreateUserPayload) {
  return (await api.post<UserSummary>('/api/admin/users', payload)).data
}

export async function updateUser(id: string, payload: { username: string; displayName: string }) {
  return (await api.put<UserSummary>(`/api/admin/users/${id}`, payload)).data
}

export async function setUserActive(id: string, active: boolean) {
  return (await api.patch<UserSummary>(`/api/admin/users/${id}/status`, { active })).data
}

export async function setUserRole(id: string, role: UserRole) {
  return (await api.patch<UserSummary>(`/api/admin/users/${id}/role`, { role })).data
}

export async function resetUserPassword(id: string, newPassword: string) {
  await api.patch(`/api/admin/users/${id}/password`, { newPassword })
}