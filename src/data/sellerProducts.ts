const KEY = 'gogomarket-seller-products'

export interface SellerProduct {
  id: string
  name: string
  price: string
  description: string
  createdAt: number
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
