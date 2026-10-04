import type { AuthUser, DemoAccount } from '../types/auth'

let runtimeAccounts: DemoAccount[] = []

export async function loadDemoAccounts(): Promise<DemoAccount[]> {
  if (!import.meta.env.DEV) return []
  const { DEMO_USERS } = await import('../config/demoUsers')
  runtimeAccounts = DEMO_USERS.map((account) => ({ ...account }))
  return runtimeAccounts
}

export function getDemoAccounts(): DemoAccount[] {
  return runtimeAccounts.map((account) => ({ ...account }))
}

export function replaceDemoAccounts(accounts: DemoAccount[]): void {
  runtimeAccounts = accounts.map((account) => ({ ...account }))
}

export function authenticateDemo(username: string, password: string): AuthUser | null {
  if (!import.meta.env.DEV) return null
  const account = runtimeAccounts.find(
    (candidate) => candidate.active && candidate.username.toLowerCase() === username.trim().toLowerCase() && candidate.password === password,
  )
  if (!account) return null
  const { id, displayName, role, tableAccount, tableNumber } = account
  return { id, username: account.username, displayName, role, tableAccount, tableNumber }
}