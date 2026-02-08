/**
 * Роли пользователя (ТЗ: 5 ролей — Покупатель, 2 типа Продавцов, Курьер, Админ).
 * SELLER_FULL = полный магазин (инвентарь), SELLER_SIMPLE = объявления (дилер).
 */
export enum UserRole {
  BUYER = 'BUYER',
  SELLER_FULL = 'SELLER_FULL',
  SELLER_SIMPLE = 'SELLER_SIMPLE',
  COURIER = 'COURIER',
  ADMIN = 'ADMIN',
}

/** Тип продавца товара: магазин (В корзину) или объявление (Связаться). */
export type SellerType = 'FULL' | 'SIMPLE'

/** Категории для объявлений (SELLER_SIMPLE). */
export type SimpleCategory = 'auto' | 'realty' | 'services'

/** Причина открытия спора (ТЗ 3.1). */
export type DisputeReason = 'damage' | 'courier_no_show' | 'wrong_item' | 'other'

/** Статус спора. */
export type DisputeStatus = 'open' | 'resolved_buyer' | 'resolved_seller' | 'rejected'

/** Решение админа по спору (ТЗ 5: решение в течение 48 ч). */
export type DisputeResolution = 'refund_full' | 'refund_partial' | 'reject' | null

/** Заказ: базовые поля + данные спора для OrderActionSheet и админки. */
export interface Order {
  id: string
  date: string
  total: number
  status: string
  items: string
  /** Спор: открыт ли */
  disputeStatus?: DisputeStatus | null
  /** Причина спора (повреждение, курьер не приехал и т.д.) */
  disputeReason?: DisputeReason | null
  /** Текстовое описание от покупателя */
  disputeComment?: string | null
  /** Когда открыт спор (ISO), для дедлайна 48 ч */
  disputeOpenedAt?: string | null
  /** Решение админа */
  disputeResolution?: DisputeResolution | null
  /** Кто решил (admin user id) */
  disputeResolvedBy?: string | null
  /** Когда решён (ISO) */
  disputeResolvedAt?: string | null
  /** Последняя известная широта курьера (трекинг) */
  lastCourierLat?: number | null
  /** Последняя известная долгота курьера (трекинг) */
  lastCourierLng?: number | null
  /** Время последнего обновления позиции (ISO) */
  lastCourierAt?: string | null
}
