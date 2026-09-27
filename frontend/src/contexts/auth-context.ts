import { createContext } from 'react'
import type { AuthUser, DemoAccount } from '../types/auth'

export interface AuthContextValue {
  user: AuthUser | null
  accounts: DemoAccount[]
  ready: boolean
  login: (username: string, password: string) => Promise<AuthUser | null>
  logout: () => void
  updateAccounts: (accounts: DemoAccount[]) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)