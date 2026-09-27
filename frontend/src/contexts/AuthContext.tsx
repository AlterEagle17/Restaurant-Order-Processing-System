import { useEffect, useState, type ReactNode } from 'react'
import type { AuthUser, DemoAccount } from '../types/auth'
import { authenticateDemo, getDemoAccounts, loadDemoAccounts, replaceDemoAccounts } from '../services/authService'
import { AuthContext } from './auth-context'

const SESSION_KEY = 'restaurant-demo-session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accounts, setAccounts] = useState<DemoAccount[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    void loadDemoAccounts().then((availableAccounts) => {
      if (!active) return
      setAccounts(availableAccounts)
      try {
        const saved = sessionStorage.getItem(SESSION_KEY)
        const candidate = saved ? (JSON.parse(saved) as AuthUser) : null
        const account = candidate && availableAccounts.find((entry) => entry.id === candidate.id && entry.active && entry.role === candidate.role)
        if (account && import.meta.env.DEV) setUser(candidate)
      } catch {
        sessionStorage.removeItem(SESSION_KEY)
      }
      setReady(true)
    })
    return () => { active = false }
  }, [])

  async function login(username: string, password: string) {
    if (!import.meta.env.DEV) return null
    const account = authenticateDemo(username, password)
    if (account) {
      setUser(account)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(account))
    }
    return account
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }

  function updateAccounts(nextAccounts: DemoAccount[]) {
    replaceDemoAccounts(nextAccounts)
    setAccounts(getDemoAccounts())
    if (user && !nextAccounts.some((account) => account.id === user.id && account.active && account.role === user.role)) logout()
  }

  return <AuthContext.Provider value={{ user, accounts, ready, login, logout, updateAccounts }}>{children}</AuthContext.Provider>
}