/**
 * API client для GogoMarket backend.
 * Используется, когда задан VITE_API_URL (например http://localhost:3001).
 */

const base = (): string => (import.meta.env.VITE_API_URL as string)?.trim() || ''

export interface ApiProduct {
  id: string
  name: string
  price: number
  description: string
  sellerType: 'FULL' | 'SIMPLE'
  imageUrl?: string | null
  videoUrl?: string | null
}

export interface ApiOrder {
  id: string
  date: string
  total: number
  status: string
  items: string
  assignedToCourierId?: string | null
  disputeStatus?: string | null
  disputeReason?: string | null
  disputeComment?: string | null
  disputeOpenedAt?: string | null
  disputeResolution?: string | null
  disputeResolvedBy?: string | null
  disputeResolvedAt?: string | null
  lastCourierLat?: number | null
  lastCourierLng?: number | null
  lastCourierAt?: string | null
}

export interface ApiCourier {
  id: string
  email: string
}

const TOKEN_KEY = 'gogomarket-token'

export function isApiEnabled(): boolean {
  return base().length > 0
}

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

async function fetchJson<T>(path: string, init?: RequestInit, requireAuth = false): Promise<T> {
  const url = `${base().replace(/\/$/, '')}${path}`
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init?.headers as Record<string, string>) }
  if (requireAuth) {
    const token = getStoredToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(url, { ...init, headers })
  if (!res.ok) {
    if (res.status === 429) throw new Error('rateLimitExceeded')
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

export async function apiHealth(): Promise<{ ok: boolean }> {
  return fetchJson('/health')
}

export async function apiProducts(): Promise<ApiProduct[]> {
  return fetchJson('/products')
}

export async function apiOrders(): Promise<ApiOrder[]> {
  return fetchJson('/orders')
}

export async function apiOrdersWithDisputes(): Promise<ApiOrder[]> {
  return fetchJson('/orders/disputes')
}

export async function apiCreateOrder(dto: { total: number; status: string; items: string }): Promise<ApiOrder> {
  return fetchJson('/orders', {
    method: 'POST',
    body: JSON.stringify(dto),
  }, true)
}

export async function apiOpenDispute(orderId: string, reason: string, comment?: string): Promise<void> {
  await fetchJson(`/orders/${orderId}/dispute`, {
    method: 'PATCH',
    body: JSON.stringify({ reason, comment }),
  }, true)
}

export async function apiResolveDispute(
  orderId: string,
  resolution: string,
  resolvedBy: string
): Promise<void> {
  await fetchJson(`/orders/${orderId}/dispute/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ resolution, resolvedBy }),
  }, true)
}

export async function apiNewOrdersForSeller(): Promise<ApiOrder[]> {
  return fetchJson('/orders/new-for-seller', undefined, true)
}

export async function apiConfirmOrder(orderId: string): Promise<ApiOrder> {
  return fetchJson(`/orders/${orderId}/confirm`, { method: 'PATCH' }, true)
}

export async function apiCouriers(): Promise<ApiCourier[]> {
  return fetchJson('/users/couriers', undefined, true)
}

export async function apiAssignCourier(orderId: string, courierId: string): Promise<ApiOrder> {
  return fetchJson(`/orders/${orderId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ courierId }),
  }, true)
}

export async function apiMyDeliveries(): Promise<ApiOrder[]> {
  return fetchJson('/orders/my-deliveries', undefined, true)
}

export async function apiUpdateOrderStatus(orderId: string, status: string): Promise<ApiOrder> {
  return fetchJson(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, true)
}

async function fetchWithAuth(path: string, init: RequestInit & { body?: FormData | string }): Promise<unknown> {
  const url = `${base().replace(/\/$/, '')}${path}`
  const headers: Record<string, string> = {}
  const token = getStoredToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!(init.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init.headers as Record<string, string>) } })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json()
}

export async function apiUploadMedia(file: File): Promise<{ url: string }> {
  const form = new FormData()
  form.append('file', file)
  return fetchWithAuth('/media/upload', { method: 'POST', body: form }) as Promise<{ url: string }>
}

export async function apiCreateProduct(dto: {
  name: string
  price: number
  description?: string
  sellerType: 'FULL' | 'SIMPLE'
  imageUrl?: string | null
  videoUrl?: string | null
}): Promise<ApiProduct> {
  return fetchJson('/products', { method: 'POST', body: JSON.stringify(dto) }, true) as Promise<ApiProduct>
}

export async function apiUpdateProduct(
  id: string,
  dto: { name?: string; price?: number; description?: string; sellerType?: 'FULL' | 'SIMPLE'; imageUrl?: string | null; videoUrl?: string | null }
): Promise<ApiProduct> {
  return fetchJson(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }, true) as Promise<ApiProduct>
}

export interface ApiTrackPoint {
  lat: number
  lng: number
  at: string
}

export async function apiOrderTracks(orderId: string): Promise<ApiTrackPoint[]> {
  return fetchJson(`/orders/${orderId}/tracks`, undefined, true) as Promise<ApiTrackPoint[]>
}
