import { api } from './api'
import type { AuthUser, CurrentUserResponse, LoginResponse, UserRole } from '../types/auth'

function isRole(role: string): role is UserRole {
  return ['ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN_STAFF', 'CUSTOMER'].includes(role)
}

function mapUser(user: AuthUser): AuthUser {
  if (!user.id || !user.username || !user.displayName || !isRole(user.role)) {
    throw new Error('The server returned an invalid user profile.')
  }
  return user
}

export async function loginWithApi(username: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/api/auth/login', { username, password })
  if (!response.data.accessToken || response.data.tokenType !== 'Bearer') {
    throw new Error('The server returned an invalid authentication response.')
  }
  return { ...response.data, user: mapUser(response.data.user) }
}

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  const response = await api.get<CurrentUserResponse>('/api/auth/me')
  if (response.data.active !== true) throw new Error('This account is inactive.')
  return { ...response.data, ...mapUser(response.data) }
}