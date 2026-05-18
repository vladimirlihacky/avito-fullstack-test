import { useUnit } from 'effector-react'
import { $authReady, $isAdmin, $isAuthenticated } from '@/shared/api/model'
import { Navigate, Outlet } from 'react-router'

export function AdminGuard() {
  const { ready, isAuthenticated, isAdmin } = useUnit({
    ready: $authReady,
    isAuthenticated: $isAuthenticated,
    isAdmin: $isAdmin,
  })

  if (!ready) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/assistants" replace />
  }

  return <Outlet />
}
