import type { SellerType } from '../types'
import type { SimpleCategory } from '../types'

const KEY = 'gogomarket-seller-products'

export interface SellerProduct {
  id: string
  name: string
  price: string
  description: string
  createdAt: number
  /** FULL = инвентарь магазина, SIMPLE = объявление (дилер) */
  sellerType?: SellerType
  /** Только для SIMPLE: авто | недвижимость | услуги */
  category?: SimpleCategory
  /** Для категории auto: пробег (км) */
  mileage?: string
  /** Для категории realty: площадь (м²) */
  area?: string
}

export function loadSellerProducts(): SellerProduct[] {
  try {
    const s = localStorage.getItem(KEY)
    if (s) return JSON.parse(s)
  } catch {}
  return []
}

export function saveSellerProducts(items: SellerProduct[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}
