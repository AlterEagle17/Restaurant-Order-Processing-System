import { createContext, useContext, useEffect, useState } from 'react'
import api from './api'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const token = sessionStorage.getItem('restaurant-token')
    if (!token) { setReady(true); return }
    api.get('/auth/me').then(({ data }) => setUser(data)).catch(() => sessionStorage.removeItem('restaurant-token')).finally(() => setReady(true))
  }, [])
  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password })
    sessionStorage.setItem('restaurant-token', data.token)
    setUser(data.user)
    return data.user
  }
  const logout = async () => {
    try { await api.post('/auth/logout') } finally { sessionStorage.removeItem('restaurant-token'); setUser(null) }
  }
  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)