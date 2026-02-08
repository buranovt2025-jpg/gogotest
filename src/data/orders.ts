const KEY = 'gogomarket-buyer-orders'

export interface Order {
  id: string
  date: string
  total: number
  status: string
  items: string
}

const SEED: Order[] = [
  { id: 'O-1001', date: '2026-02-07', total: 34980, status: 'Доставлен', items: 'Смартфон X, Наушники Pro' },
  { id: 'O-1002', date: '2026-02-05', total: 790, status: 'Отменён', items: 'Чехол универсальный' },
]

export function loadOrders(): Order[] {
  try {
    const s = localStorage.getItem(KEY)
    if (s) return JSON.parse(s)
    saveOrders(SEED)
    return SEED
  } catch {}
  return SEED
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(KEY, JSON.stringify(orders))
}

export function addOrder(order: Omit<Order, 'id' | 'date'>): Order {
  const orders = loadOrders()
  const newOrder: Order = {
    ...order,
    id: `O-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
  }
  saveOrders([newOrder, ...orders])
  return newOrder
}
