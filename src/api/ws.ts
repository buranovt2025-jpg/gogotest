/**
 * WebSocket (Socket.IO) для чата.
 * Подключается к тому же хосту, что и REST API (VITE_API_URL), когда он задан.
 */

import { io, type Socket } from 'socket.io-client'

const base = (): string => (import.meta.env.VITE_API_URL as string)?.trim() || ''

let socket: Socket | null = null

export function getSocket(): Socket | null {
  if (!base()) return null
  if (socket?.connected) return socket
  try {
    socket = io(base(), { path: '/socket.io', transports: ['websocket', 'polling'] })
    return socket
  } catch {
    return null
  }
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
