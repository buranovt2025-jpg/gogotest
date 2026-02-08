import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { OrdersService } from '../orders/orders.service'

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server!: Server

  constructor(private readonly ordersService: OrdersService) {}

  @SubscribeMessage('message')
  handleMessage(@MessageBody() payload: { room?: string; text: string }) {
    const { room = 'general', text } = payload
    this.server.to(room).emit('message', { text, at: new Date().toISOString() })
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: { join: (room: string) => void }, @MessageBody() room: string) {
    client.join(room)
  }

  @SubscribeMessage('tracking:join')
  handleTrackingJoin(@ConnectedSocket() client: { join: (room: string) => void }, @MessageBody() orderId: string) {
    if (orderId && typeof orderId === 'string') client.join(`order-${orderId}`)
  }

  @SubscribeMessage('tracking:location')
  handleTrackingLocation(@MessageBody() payload: { orderId: string; lat: number; lng: number }) {
    const { orderId, lat, lng } = payload
    if (!orderId || typeof lat !== 'number' || typeof lng !== 'number') return
    this.server.to(`order-${orderId}`).emit('tracking:location', { lat, lng })
    this.ordersService.updateCourierPosition(orderId, lat, lng).catch(() => {})
  }
}
