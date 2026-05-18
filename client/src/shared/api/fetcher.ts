import type { ApiError, Token } from './types'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiRequestError extends Error {
  public readonly status: number
  public readonly code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
  }
}

const TOKEN_KEY = 'auth_token'
const AUTH_DATA_KEY = 'auth_data'

export const tokenStorage = {
  get: (): string | null =>
    sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY),

  set: (token: string): void => {
    sessionStorage.setItem(TOKEN_KEY, token)
    localStorage.removeItem(TOKEN_KEY)
  },

  clear: (): void => {
    sessionStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
  },
}

export const authStorage = {
  get(): Token | null {
    try {
      const raw = sessionStorage.getItem(AUTH_DATA_KEY)
      return raw ? (JSON.parse(raw) as Token) : null
    } catch {
      return null
    }
  },
  set(data: Token): void {
    sessionStorage.setItem(AUTH_DATA_KEY, JSON.stringify(data))
  },
  clear(): void {
    sessionStorage.removeItem(AUTH_DATA_KEY)
  },
}

type QueryParams = Record<string, string | number | boolean | undefined | null>

export function buildQuery(params: QueryParams): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      search.set(key, String(value))
    }
  }

  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  skipAuth?: boolean
}

export async function apiFetch<T>(
  path: string,
  { body, skipAuth = false, headers: extraHeaders, ...init }: FetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  }

  if (!skipAuth) {
    const token = tokenStorage.get()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let errorBody: ApiError

    try {
      errorBody = (await response.json()) as ApiError
    } catch {
      throw new ApiRequestError(
        response.status,
        'INTERNAL_ERROR',
        response.statusText,
      )
    }

    throw new ApiRequestError(
      response.status,
      errorBody.error.code,
      errorBody.error.message,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
