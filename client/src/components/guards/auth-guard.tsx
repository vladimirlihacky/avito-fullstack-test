import { useUnit } from 'effector-react'
import { $authReady, $isAuthenticated } from '@/shared/api/model'
import { Navigate, Outlet, useLocation } from 'react-router'

export function AuthGuard() {
  const location = useLocation()
  const { ready, isAuthenticated } = useUnit({
    ready: $authReady,
    isAuthenticated: $isAuthenticated,
  })

  if (!ready) {
    // Still initializing from session — show nothing, avoid flash of login
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
