import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

export function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const getString = useCallback(
    (key: string, fallback = '') => searchParams.get(key) ?? fallback,
    [searchParams],
  )

  const getNumber = useCallback(
    (key: string, fallback?: number): number | undefined => {
      const v = searchParams.get(key)
      if (v === null) return fallback
      const n = Number(v)
      return Number.isNaN(n) ? fallback : n
    },
    [searchParams],
  )

  const getBoolean = useCallback(
    (key: string, fallback = false): boolean => {
      const v = searchParams.get(key)
      if (v === null) return fallback
      return v === 'true'
    },
    [searchParams],
  )

  const setParams = useCallback(
    (updates: Record<string, string | number | boolean | undefined | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(updates)) {
          if (value == null || value === '') {
            next.delete(key)
          } else {
            next.set(key, String(value))
          }
        }
        return next
      })
    },
    [setSearchParams],
  )

  return { getString, getNumber, getBoolean, setParams, rawParams: searchParams }
}
