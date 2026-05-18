import { useEffect } from 'react'
import { initAuth } from '@/shared/api/model'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAuth()
  }, [])
  return children
}
