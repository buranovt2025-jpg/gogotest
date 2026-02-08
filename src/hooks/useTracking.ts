/**
 * Подписка на обновления позиции курьера по заказу через WebSocket.
 * Курьер отправляет tracking:location, покупатель получает обновления здесь.
 */

import { useState, useEffect, useRef } from 'react'
import { getSocket } from '../api/ws'

export function useTracking(orderId: string | null): { lat: number | null; lng: number | null } {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const joinedRef = useRef(false)

  useEffect(() => {
    if (!orderId) {
      setPosition(null)
      return
    }
    const socket = getSocket()
    if (!socket) return

    const room = `order-${orderId}`
    if (!joinedRef.current) {
      socket.emit('tracking:join', orderId)
      joinedRef.current = true
    }

    const onLocation = (payload: { lat: number; lng: number }) => {
      setPosition({ lat: payload.lat, lng: payload.lng })
    }
    socket.on('tracking:location', onLocation)

    return () => {
      socket.off('tracking:location', onLocation)
      joinedRef.current = false
      setPosition(null)
    }
  }, [orderId])

  return {
    lat: position?.lat ?? null,
    lng: position?.lng ?? null,
  }
}
