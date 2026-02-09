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
    if (!email.trim() || !password.trim()) {
      throw new Error('Заполните email и пароль')
    }
    
    const envUrl = (import.meta.env.VITE_API_URL as string)?.trim()
    const o = typeof window !== 'undefined' && window.location?.origin
    const apiBase = envUrl || (o && (o.startsWith('http://') || o.startsWith('https://')) ? `${o}/api` : '')
    
    if (!apiBase) {
      throw new Error('API не настроен. Проверьте VITE_API_URL или откройте сайт с того же хоста, где работает API.')
    }
    
    const url = `${apiBase.replace(/\/$/, '')}/auth/login`
    
    let res: Response
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
    } catch (err) {
      console.error('Login fetch error:', err)
      throw new Error('Сервер недоступен. Проверьте подключение и убедитесь, что API запущен.')
    }
    
    if (!res.ok) {
      let errorMessage = `Ошибка ${res.status}`
      try {
        const data = await res.json()
        errorMessage = (data as { message?: string })?.message || errorMessage
      } catch {
        // Если не удалось распарсить JSON, используем стандартное сообщение
      }
      
      if (res.status === 401) {
        throw new Error('Неверный email или пароль')
      }
      if (res.status === 429) {
        throw new Error('Слишком много запросов. Подождите минуту.')
      }
      throw new Error(errorMessage)
    }
    
    const data = await res.json()
    const t = data.access_token
    const u = data.user as AuthUser
    
    if (!t || !u) {
      throw new Error('Неверный ответ от сервера')
    }
    
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setToken(t)
    setUser(u)
  }, [])

  const register = useCallback(async (email: string, password: string, role: string) => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Заполните email и пароль')
    }
    
    if (password.length < 6) {
      throw new Error('Пароль должен быть не менее 6 символов')
    }
    
    const envUrl = (import.meta.env.VITE_API_URL as string)?.trim()
    const o = typeof window !== 'undefined' && window.location?.origin
    const apiBase = envUrl || (o && (o.startsWith('http://') || o.startsWith('https://')) ? `${o}/api` : '')
    
    if (!apiBase) {
      throw new Error('API не настроен. Проверьте VITE_API_URL или откройте сайт с того же хоста, где работает API.')
    }
    
    const url = `${apiBase.replace(/\/$/, '')}/auth/register`
    
    let res: Response
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, role }),
      })
    } catch (err) {
      console.error('Register fetch error:', err)
      throw new Error('Сервер недоступен. Проверьте подключение и убедитесь, что API запущен.')
    }
    
    if (!res.ok) {
      let errorMessage = `Ошибка ${res.status}`
      try {
        const data = await res.json()
        errorMessage = (data as { message?: string })?.message || errorMessage
      } catch {
        // Если не удалось распарсить JSON, используем стандартное сообщение
      }
      
      if (res.status === 401 || res.status === 409) {
        throw new Error(errorMessage || 'Пользователь с таким email уже существует')
      }
      if (res.status === 429) {
        throw new Error('Слишком много запросов. Подождите минуту.')
      }
      throw new Error(errorMessage)
    }
    
    const data = await res.json()
    const t = data.access_token
    const u = data.user as AuthUser
    
    if (!t || !u) {
      throw new Error('Неверный ответ от сервера')
    }
    
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
