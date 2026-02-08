import type { SellerType } from '../types'

export interface CatalogProduct {
  id: string
  name: string
  price: number
  description: string
  /** FULL = магазин (В корзину), SIMPLE = объявление (Связаться), бейдж Dealer */
  sellerType: SellerType
}

export const CATALOG: CatalogProduct[] = [
  { id: '1', name: 'Смартфон X', price: 29990, description: 'Экран 6.1", 128 ГБ, камера 12 Мп.', sellerType: 'FULL' },
  { id: '2', name: 'Наушники Pro', price: 4990, description: 'Беспроводные, шумоподавление, до 30 ч работы.', sellerType: 'FULL' },
  { id: '3', name: 'Чехол универсальный', price: 790, description: 'Силикон, защита по краям.', sellerType: 'SIMPLE' },
  { id: '4', name: 'Зарядка быстрая 30W', price: 1490, description: 'USB-C, быстрая зарядка до 30 Вт.', sellerType: 'FULL' },
]

export type ProductId = CatalogProduct['id']
