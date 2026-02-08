import type { Order } from '../types'
import type { DisputeReason } from '../types'

const KEY = 'gogomarket-buyer-orders'

export type { Order }

const SEED: Order[] = [
  { id: 'O-1001', date: '2026-02-07', total: 34980, status: 'Доставлен', items: 'Смартфон X, Наушники Pro' },
  { id: 'O-1002', date: '2026-02-05', total: 790, status: 'Отменён', items: 'Чехол универсальный' },
  {
    id: 'O-1003',
    date: '2026-02-08',
    total: 4990,
    status: 'Доставлен',
    items: 'Наушники Pro',
    disputeStatus: 'open',
    disputeReason: 'damage',
    disputeComment: 'Пришли с царапиной на корпусе.',
    disputeOpenedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export function loadOrders(): Order[] {
  try {
    const s = localStorage.getItem(KEY)
    if (s) return JSON.parse(s)
    saveOrders(SEED)
    return SEED
  } catch {}
  return SEED
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(KEY, JSON.stringify(orders))
}

export function addOrder(order: Omit<Order, 'id' | 'date'>): Order {
  const orders = loadOrders()
  const newOrder: Order = {
    ...order,
    id: `O-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
  }
  saveOrders([newOrder, ...orders])
  return newOrder
}

/** Открыть спор по заказу (ТЗ 3.1). Дедлайн решения — 48 ч с disputeOpenedAt. */
export function openDispute(orderId: string, reason: DisputeReason, comment?: string): void {
  const orders = loadOrders()
  const now = new Date().toISOString()
  const next = orders.map((o) =>
    o.id === orderId
      ? { ...o, disputeStatus: 'open' as const, disputeReason: reason, disputeComment: comment || null, disputeOpenedAt: now }
      : o
  )
  saveOrders(next)
}

/** Решить спор (админ, ТЗ 5). */
export function resolveDispute(orderId: string, resolution: NonNullable<Order['disputeResolution']>, resolvedBy: string): void {
  const orders = loadOrders()
  const now = new Date().toISOString()
  const status = resolution === 'reject' ? 'rejected' as const : resolution === 'refund_full' ? 'resolved_buyer' as const : 'resolved_buyer' as const
  const next = orders.map((o) =>
    o.id === orderId && o.disputeStatus === 'open'
      ? { ...o, disputeStatus: status, disputeResolution: resolution, disputeResolvedBy: resolvedBy, disputeResolvedAt: now }
      : o
  )
  saveOrders(next)
}

/** Все заказы с открытым спором (для админки). */
export function loadOrdersWithDisputes(): Order[] {
  return loadOrders().filter((o) => o.disputeStatus === 'open')
}
