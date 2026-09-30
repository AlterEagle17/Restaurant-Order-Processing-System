import type { DemoAccount } from '../types/auth'

export const DEMO_USERS: DemoAccount[] = [
  { id: 'user-admin', username: 'admin@restaurant.test', password: 'Admin@12345', displayName: 'Alex Morgan', role: 'ADMIN', active: true },
  { id: 'user-manager', username: 'manager@restaurant.test', password: 'Manager@12345', displayName: 'Jamie Chen', role: 'MANAGER', active: true },
  { id: 'user-cashier', username: 'cashier@restaurant.test', password: 'Cashier@12345', displayName: 'Taylor Brooks', role: 'CASHIER', active: true },
  { id: 'user-waiter', username: 'waiter@restaurant.test', password: 'Waiter@12345', displayName: 'Morgan Lee', role: 'WAITER', active: true },
  { id: 'user-kitchen', username: 'kitchen@restaurant.test', password: 'Kitchen@12345', displayName: 'Riley Patel', role: 'KITCHEN_STAFF', active: true },
  { id: 'user-customer', username: 'customer@restaurant.test', password: 'Customer@12345', displayName: 'Jordan Ellis', role: 'CUSTOMER', active: true },
]