import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

export type UserRole = 'admin' | 'user'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  createdAt?: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (user: AuthUser, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Primary storage is sessionStorage; localStorage fallback helps migrate old sessions.
  useEffect(() => {
    const savedToken =
      sessionStorage.getItem('auth_token') ?? localStorage.getItem('auth_token')
    const savedUser =
      sessionStorage.getItem('auth_user') ?? localStorage.getItem('auth_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      sessionStorage.setItem('auth_token', savedToken)
      sessionStorage.setItem('auth_user', savedUser)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }, [])

  const login = useCallback((newUser: AuthUser, newToken: string) => {
    setUser(newUser)
    setToken(newToken)
    sessionStorage.setItem('auth_token', newToken)
    sessionStorage.setItem('auth_user', JSON.stringify(newUser))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }, [])

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    logout,
  }), [user, token, login, logout])

  return (
    <AuthContext.Provider
      value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
