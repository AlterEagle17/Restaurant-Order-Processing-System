import { useEffect, useState, type ReactNode } from 'react'
import type { AuthUser, DemoAccount } from '../types/auth'
import { authenticateDemo, getDemoAccounts, loadDemoAccounts, replaceDemoAccounts } from '../services/authService'
import { fetchCurrentUser, loginWithApi } from '../services/authApi'
import { setApiToken, setUnauthorizedHandler } from '../services/api'
import { AuthContext } from './auth-context'

const DEMO_SESSION_KEY = 'restaurant-demo-session'
const API_TOKEN_KEY = 'restaurant-api-token'
const demoMode = import.meta.env.DEV && import.meta.env.VITE_USE_DEMO_AUTH === 'true'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accounts, setAccounts] = useState<DemoAccount[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    setUnauthorizedHandler(() => {
      sessionStorage.removeItem(API_TOKEN_KEY)
      setApiToken(null)
      if (mounted) setUser(null)
    })

    async function restoreSession() {
      try {
        if (demoMode) {
          const availableAccounts = await loadDemoAccounts()
          if (!mounted) return
          setAccounts(availableAccounts)
          const saved = sessionStorage.getItem(DEMO_SESSION_KEY)
          const candidate = saved ? JSON.parse(saved) as AuthUser : null
          const account = candidate && availableAccounts.find(
            (entry) => entry.id === candidate.id && entry.active && entry.role === candidate.role,
          )
          if (account) {
            setUser({ id: account.id, username: account.username, displayName: account.displayName, role: account.role })
          }
        } else {
          const token = sessionStorage.getItem(API_TOKEN_KEY)
          if (token) {
            setApiToken(token)
            const currentUser = await fetchCurrentUser()
            if (mounted) setUser(currentUser)
          }
        }
      } catch {
        sessionStorage.removeItem(DEMO_SESSION_KEY)
        sessionStorage.removeItem(API_TOKEN_KEY)
        setApiToken(null)
        if (mounted) setUser(null)
      } finally {
        if (mounted) setReady(true)
      }
    }

    void restoreSession()
    return () => {
      mounted = false
      setUnauthorizedHandler(undefined)
    }
  }, [])

  async function login(username: string, password: string): Promise<AuthUser> {
    if (demoMode) {
      const account = authenticateDemo(username, password)
      if (!account) throw new Error('Those credentials did not match an active demo account.')
      const demoUser: AuthUser = {
        id: account.id,
        username: account.username,
        displayName: account.displayName,
        role: account.role,
      }
      setUser(demoUser)
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser))
      return demoUser
    }

    setApiToken(null)
    sessionStorage.removeItem(API_TOKEN_KEY)
    const result = await loginWithApi(username, password)
    setApiToken(result.accessToken)
    sessionStorage.setItem(API_TOKEN_KEY, result.accessToken)
    sessionStorage.removeItem(DEMO_SESSION_KEY)
    setUser(result.user)
    return result.user
  }

  function logout() {
    setUser(null)
    setApiToken(null)
    sessionStorage.removeItem(DEMO_SESSION_KEY)
    sessionStorage.removeItem(API_TOKEN_KEY)
  }

  function updateAccounts(nextAccounts: DemoAccount[]) {
    if (!demoMode) throw new Error('Demo accounts cannot be changed in API authentication mode.')
    replaceDemoAccounts(nextAccounts)
    setAccounts(getDemoAccounts())
    if (user && !nextAccounts.some((account) => account.id === user.id && account.active && account.role === user.role)) logout()
  }

  return (
    <AuthContext.Provider value={{ user, accounts, mode: demoMode ? 'demo' : 'api', ready, login, logout, updateAccounts }}>
      {children}
    </AuthContext.Provider>
  )
}