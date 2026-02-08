import { useState, useEffect, useCallback } from 'react'
import type { Order } from '../data/orders'
import { loadOrdersWithDisputes, resolveDispute as localResolveDispute } from '../data/orders'
import {
  isApiEnabled,
  apiOrdersWithDisputes,
  apiResolveDispute,
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
  }
}

export function useDisputes() {
  const [disputes, setDisputes] = useState<Order[]>(() =>
    isApiEnabled() ? [] : loadOrdersWithDisputes()
  )
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    if (!isApiEnabled()) {
      setDisputes(loadOrdersWithDisputes())
      return
    }
    setLoading(true)
    apiOrdersWithDisputes()
      .then((list) => setDisputes(list.map(apiOrderToOrder)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (isApiEnabled()) refresh()
  }, [refresh])

  const resolveDispute = useCallback(
    (orderId: string, resolution: string, resolvedBy: string) => {
      if (!isApiEnabled()) {
        localResolveDispute(
          orderId,
          resolution as import('../types').DisputeResolution,
          resolvedBy
        )
        setDisputes(loadOrdersWithDisputes())
        return
      }
      apiResolveDispute(orderId, resolution, resolvedBy).then(() => refresh())
    },
    [refresh]
  )

  return { disputes, loading, resolveDispute, refresh }
}
