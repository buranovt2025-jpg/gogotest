import { useState, useEffect, useCallback } from 'react'
import type { Order } from '../data/orders'
import { loadOrders, addOrder as localAddOrder, openDispute as localOpenDispute } from '../data/orders'
import {
  isApiEnabled,
  apiOrders,
  apiCreateOrder,
  apiOpenDispute,
  type ApiOrder,
} from '../api/client'

function apiOrderToOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    date: o.date,
    total: o.total,
    status: o.status,
    items: o.items,
    disputeStatus: o.disputeStatus as Order['disputeStatus'],
    disputeReason: o.disputeReason as Order['disputeReason'],
    disputeComment: o.disputeComment,
    disputeOpenedAt: o.disputeOpenedAt,
    disputeResolution: o.disputeResolution as Order['disputeResolution'],
    disputeResolvedBy: o.disputeResolvedBy,
    disputeResolvedAt: o.disputeResolvedAt,
    lastCourierLat: o.lastCourierLat ?? null,
    lastCourierLng: o.lastCourierLng ?? null,
    lastCourierAt: o.lastCourierAt ?? null,
  }
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(() => (isApiEnabled() ? [] : loadOrders()))
  const [loading, setLoading] = useState(isApiEnabled())
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(() => {
    if (!isApiEnabled()) {
      setOrders(loadOrders())
      return
    }
    setLoading(true)
    apiOrders()
      .then((list) => setOrders(list.map(apiOrderToOrder)))
      .catch((err) => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (isApiEnabled()) refresh()
  }, [refresh])

  const addOrder = useCallback(
    (dto: { total: number; status: string; items: string }) => {
      if (!isApiEnabled()) {
        localAddOrder(dto)
        setOrders(loadOrders())
        return
      }
      apiCreateOrder(dto).then(() => refresh())
    },
    [refresh]
  )

  const openDispute = useCallback(
    (orderId: string, reason: string, comment?: string) => {
      if (!isApiEnabled()) {
        localOpenDispute(orderId, reason as import('../types').DisputeReason, comment)
        setOrders(loadOrders())
        return
      }
      apiOpenDispute(orderId, reason, comment).then(() => refresh())
    },
    [refresh]
  )

  return { orders, loading, error, refresh, addOrder, openDispute }
}
