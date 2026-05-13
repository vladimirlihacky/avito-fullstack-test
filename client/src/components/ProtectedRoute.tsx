import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }

    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (!user || !roles.includes(user.role)) {
        navigate({ to: '/assistants' })
      }
    }
  }, [isAuthenticated, user, requiredRole, navigate])

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!user || !roles.includes(user.role)) {
      return null
    }
  }

  return <>{children}</>
}
