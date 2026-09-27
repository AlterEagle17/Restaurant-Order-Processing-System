export const USER_ROLES = [
  'ADMIN',
  'MANAGER',
  'CASHIER',
  'WAITER',
  'KITCHEN_STAFF',
  'CUSTOMER',
] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface DemoAccount {
  id: string
  username: string
  password: string
  displayName: string
  role: UserRole
  active: boolean
}

export interface AuthUser {
  id: string
  username: string
  displayName: string
  role: UserRole
}

export const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: '/admin',
  MANAGER: '/manager',
  CASHIER: '/cashier',
  WAITER: '/waiter',
  KITCHEN_STAFF: '/kitchen',
  CUSTOMER: '/customer',
}

export interface CurrentUserResponse extends AuthUser {
  active: boolean
}

export interface LoginResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: AuthUser
}