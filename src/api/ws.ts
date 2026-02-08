/**
 * WebSocket (Socket.IO) для чата.
 * Подключается к тому же хосту, что и REST API.
 */

import { io, type Socket } from 'socket.io-client'
import { getApiBase } from './client'

let socket: Socket | null = null

export function getSocket(): Socket | null {
  const apiBase = getApiBase()
  if (!apiBase) return null
  if (socket?.connected) return socket
  try {
    socket = io(apiBase, { path: '/socket.io', transports: ['websocket', 'polling'] })
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
