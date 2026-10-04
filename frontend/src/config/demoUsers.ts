import type { DemoAccount } from '../types/auth'

export const DEMO_USERS: DemoAccount[] = [
  { id: 'user-admin', username: 'admin@restaurant.test', password: 'Admin@12345', displayName: 'Arun Kumar', role: 'ADMIN', active: true },
  { id: 'user-manager', username: 'manager@restaurant.test', password: 'Manager@12345', displayName: 'Meena Raj', role: 'MANAGER', active: true },
  { id: 'user-cashier', username: 'cashier@restaurant.test', password: 'Cashier@12345', displayName: 'Kavitha Devi', role: 'CASHIER', active: true },
  { id: 'user-waiter', username: 'waiter@restaurant.test', password: 'Waiter@12345', displayName: 'Suresh Babu', role: 'WAITER', active: true },
  { id: 'user-kitchen', username: 'kitchen@restaurant.test', password: 'Kitchen@12345', displayName: 'Priya Nair', role: 'KITCHEN_STAFF', active: true },
  ...Array.from({ length: 12 }, (_, index) => {
    const tableNumber = index + 1
    const suffix = String(tableNumber).padStart(2, '0')
    return { id: `user-table-${suffix}`, username: `table${suffix}`, password: 'Table@12345', displayName: `Table ${suffix}`,
      role: 'CUSTOMER' as const, active: true, tableAccount: true, tableNumber }
  }),
]