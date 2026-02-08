import { ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Order as OrderEntity } from '../entities/order.entity'
import { OrderTrack } from '../entities/order-track.entity'

const TRACK_THROTTLE_MS = 30_000
const MAX_TRACKS_PER_ORDER = 500
const TRACKS_CLEANUP_OLDER_DAYS = 7

export interface OrderDto {
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

function toDto(e: OrderEntity): OrderDto {
  return {
    id: String(e.id),
    date: e.date,
    total: Number(e.total),
    status: e.status,
    items: e.items,
    assignedToCourierId: e.assignedToCourierId ?? undefined,
    disputeStatus: e.disputeStatus ?? undefined,
    disputeReason: e.disputeReason ?? undefined,
    disputeComment: e.disputeComment ?? undefined,
    disputeOpenedAt: e.disputeOpenedAt ? e.disputeOpenedAt.toISOString() : undefined,
    disputeResolution: e.disputeResolution ?? undefined,
    disputeResolvedBy: e.disputeResolvedBy ?? undefined,
    disputeResolvedAt: e.disputeResolvedAt ? e.disputeResolvedAt.toISOString() : undefined,
    lastCourierLat: e.lastCourierLat != null ? Number(e.lastCourierLat) : undefined,
    lastCourierLng: e.lastCourierLng != null ? Number(e.lastCourierLng) : undefined,
    lastCourierAt: e.lastCourierAt ? e.lastCourierAt.toISOString() : undefined,
  }
}

export const ORDER_STATUS = {
  NEW: 'Новый',
  CONFIRMED: 'Подтверждён',
  IN_DELIVERY: 'В пути',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
} as const

@Injectable()
export class OrdersService implements OnModuleInit {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>,
    @InjectRepository(OrderTrack)
    private readonly trackRepo: Repository<OrderTrack>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count()
    if (count === 0) {
      const openedAt = new Date(Date.now() - 24 * 60 * 60 * 1000)
      await this.repo.save([
        this.repo.create({ date: '2026-02-07', total: 34980, status: 'Доставлен', items: 'Смартфон X, Наушники Pro' }),
        this.repo.create({ date: '2026-02-05', total: 790, status: 'Отменён', items: 'Чехол универсальный' }),
        this.repo.create({
          date: '2026-02-08',
          total: 4990,
          status: 'Доставлен',
          items: 'Наушники Pro',
          disputeStatus: 'open',
          disputeReason: 'damage',
          disputeComment: 'Пришли с царапиной на корпусе.',
          disputeOpenedAt: openedAt,
        }),
      ])
    }
    this.cleanupOldTracks().catch(() => {})
    setInterval(() => this.cleanupOldTracks().catch(() => {}), 24 * 60 * 60 * 1000)
  }

  async findAll(): Promise<OrderDto[]> {
    const list = await this.repo.find({ order: { date: 'DESC' } })
    return list.map(toDto)
  }

  async findWithDisputes(): Promise<OrderDto[]> {
    const list = await this.repo.find({
      where: { disputeStatus: 'open' },
      order: { disputeOpenedAt: 'ASC' },
    })
    return list.map(toDto)
  }

  async create(dto: { total: number; status: string; items: string; userId?: string | null }): Promise<OrderDto> {
    const e = this.repo.create({
      userId: dto.userId ?? null,
      date: new Date().toISOString().slice(0, 10),
      total: dto.total,
      status: dto.status,
      items: dto.items,
    })
    const saved = await this.repo.save(e)
    return toDto(saved)
  }

  async openDispute(orderId: string, reason: string, comment?: string): Promise<void> {
    const now = new Date()
    await this.repo.update(orderId, {
      disputeStatus: 'open',
      disputeReason: reason,
      disputeComment: comment ?? null,
      disputeOpenedAt: now,
    })
  }

  async resolveDispute(orderId: string, resolution: string, resolvedBy: string): Promise<void> {
    const status = resolution === 'reject' ? 'rejected' : 'resolved_buyer'
    await this.repo.update(
      { id: orderId, disputeStatus: 'open' },
      {
        disputeStatus: status,
        disputeResolution: resolution,
        disputeResolvedBy: resolvedBy,
        disputeResolvedAt: new Date(),
      },
    )
  }

  async findNewForSeller(): Promise<OrderDto[]> {
    const list = await this.repo.find({
      where: { status: ORDER_STATUS.NEW },
      order: { date: 'DESC' },
    })
    return list.map(toDto)
  }

  async confirmBySeller(orderId: string): Promise<OrderDto> {
    await this.repo.update({ id: orderId, status: ORDER_STATUS.NEW }, { status: ORDER_STATUS.CONFIRMED })
    const e = await this.repo.findOne({ where: { id: orderId } })
    if (!e) throw new Error('Order not found')
    return toDto(e)
  }

  async assignCourier(orderId: string, courierId: string): Promise<OrderDto> {
    await this.repo.update(
      { id: orderId },
      { assignedToCourierId: courierId, status: ORDER_STATUS.IN_DELIVERY },
    )
    const e = await this.repo.findOne({ where: { id: orderId } })
    if (!e) throw new Error('Order not found')
    return toDto(e)
  }

  async findForCourier(courierId: string): Promise<OrderDto[]> {
    const list = await this.repo.find({
      where: { assignedToCourierId: courierId },
      order: { date: 'DESC' },
    })
    return list.map(toDto)
  }

  async updateStatus(orderId: string, status: string): Promise<OrderDto> {
    await this.repo.update({ id: orderId }, { status })
    const e = await this.repo.findOne({ where: { id: orderId } })
    if (!e) throw new Error('Order not found')
    return toDto(e)
  }

  async updateCourierPosition(orderId: string, lat: number, lng: number): Promise<void> {
    const order = await this.repo.findOne({ where: { id: orderId, status: ORDER_STATUS.IN_DELIVERY } })
    if (!order) return
    const now = new Date()
    if (order.lastCourierAt && now.getTime() - order.lastCourierAt.getTime() < TRACK_THROTTLE_MS) return
    await this.repo.update(
      { id: orderId },
      { lastCourierLat: lat, lastCourierLng: lng, lastCourierAt: now },
    )
    await this.trackRepo.save(this.trackRepo.create({ orderId, lat, lng, createdAt: now }))
    await this.trimTracksForOrder(orderId)
  }

  private async trimTracksForOrder(orderId: string): Promise<void> {
    const count = await this.trackRepo.count({ where: { orderId } })
    if (count <= MAX_TRACKS_PER_ORDER) return
    const toRemove = count - MAX_TRACKS_PER_ORDER
    const oldest = await this.trackRepo.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
      take: toRemove,
      select: ['id'],
    })
    if (oldest.length) await this.trackRepo.delete(oldest.map((t) => t.id))
  }

  async cleanupOldTracks(): Promise<number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - TRACKS_CLEANUP_OLDER_DAYS)
    const doneOrders = await this.repo.find({
      where: [{ status: ORDER_STATUS.DELIVERED }, { status: ORDER_STATUS.CANCELLED }],
      select: ['id'],
    })
    const ids = doneOrders.map((o) => o.id)
    if (ids.length === 0) return 0
    const result = await this.trackRepo
      .createQueryBuilder()
      .delete()
      .where('orderId IN (:...ids)', { ids })
      .andWhere('createdAt < :cutoff', { cutoff })
      .execute()
    return result.affected ?? 0
  }

  async getTracks(orderId: string): Promise<{ lat: number; lng: number; at: string }[]> {
    const list = await this.trackRepo.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    })
    return list.map((t) => ({
      lat: Number(t.lat),
      lng: Number(t.lng),
      at: t.createdAt.toISOString(),
    }))
  }

  async getTracksForOrder(orderId: string, userId: string, role: string): Promise<{ lat: number; lng: number; at: string }[]> {
    const order = await this.repo.findOne({ where: { id: orderId } })
    if (!order) throw new NotFoundException('Order not found')
    const isAdmin = role === 'ADMIN'
    const isBuyer = role === 'BUYER' && order.userId === userId
    const isCourier = role === 'COURIER' && order.assignedToCourierId === userId
    if (!isAdmin && !isBuyer && !isCourier) throw new ForbiddenException()
    return this.getTracks(orderId)
  }
}
