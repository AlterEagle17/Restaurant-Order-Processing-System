import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { ROLE_HOME, type UserRole } from '../types/auth'

export function ProtectedRoute({ role }: { role: UserRole }) {
  const { user, ready } = useAuth()
  if (!ready) return <div className="route-loading">Loading workspace...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role]} replace />
  return <Outlet />
}