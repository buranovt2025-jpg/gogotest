import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { isApiEnabled } from '../api/client'

const TOKEN_KEY = 'gogomarket-token'
const USER_KEY = 'gogomarket-user'

export interface AuthUser {
  id: string
  email: string
  role: string
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const defaultState: AuthState = {
  token: null,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
}

const AuthContext = createContext<AuthState>(defaultState)

function loadStored(): { token: string | null; user: AuthUser | null } {
  if (!isApiEnabled()) return { token: null, user: null }
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const userJson = localStorage.getItem(USER_KEY)
    const user = userJson ? (JSON.parse(userJson) as AuthUser) : null
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const { token: t, user: u } = loadStored()
    setToken(t)
    setUser(u)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const envUrl = (import.meta.env.VITE_API_URL as string)?.trim()
    const o = typeof window !== 'undefined' && window.location?.origin
    const apiBase = envUrl || (o && (o.startsWith('http://') || o.startsWith('https://')) ? `${o}/api` : '')
    let res: Response
    try {
      res = await fetch(`${apiBase.replace(/\/$/, '')}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
    } catch {
      throw new Error('Сервер недоступен. Проверьте подключение.')
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const msg = (data as { message?: string })?.message
      throw new Error(msg || (res.status === 401 ? 'Неверный email или пароль' : `Ошибка ${res.status}`))
    }
    const data = await res.json()
    const t = data.access_token
    const u = data.user as AuthUser
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setToken(t)
    setUser(u)
  }, [])

  const register = useCallback(async (email: string, password: string, role: string) => {
    const envUrl = (import.meta.env.VITE_API_URL as string)?.trim()
    const o = typeof window !== 'undefined' && window.location?.origin
    const apiBase = envUrl || (o && (o.startsWith('http://') || o.startsWith('https://')) ? `${o}/api` : '')
    let res: Response
    try {
      res = await fetch(`${apiBase.replace(/\/$/, '')}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })
    } catch {
      throw new Error('Сервер недоступен. Проверьте подключение.')
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const msg = (data as { message?: string })?.message
      throw new Error(msg || `Ошибка ${res.status}`)
    }
    const data = await res.json()
    const t = data.access_token
    const u = data.user as AuthUser
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setToken(t)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value: AuthState = {
    token,
    user,
    login,
    register,
    logout,
    isAuthenticated: isApiEnabled() && !!token && !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
