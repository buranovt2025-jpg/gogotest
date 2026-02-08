import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { CATALOG } from '../data/catalog'

const CART_KEY = 'gogomarket-cart'

const MOCK_ORDERS = [
  { id: 'O-1001', date: '2026-02-07', total: 34980, status: 'Доставлен', items: 'Смартфон X, Наушники Pro' },
  { id: 'O-1002', date: '2026-02-05', total: 790, status: 'Отменён', items: 'Чехол универсальный' },
]

function loadCart(): { id: string; qty: number }[] {
  try {
    const s = localStorage.getItem(CART_KEY)
    if (s) return JSON.parse(s)
  } catch {}
  return []
}

export default function Buyer() {
  const [cart, setCart] = useState<{ id: string; qty: number }[]>(loadCart)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (id: string) => {
    setCart((prev) => {
      const i = prev.findIndex((c) => c.id === id)
      if (i >= 0) {
        const next = [...prev]
        next[i].qty += 1
        return next
      }
      return [...prev, { id, qty: 1 }]
    })
  }

  const changeQty = (id: string, delta: number) => {
    setCart((prev) => {
      const i = prev.findIndex((c) => c.id === id)
      if (i < 0) return prev
      const next = [...prev]
      next[i].qty += delta
      if (next[i].qty <= 0) return next.filter((_, j) => j !== i)
      return next
    })
  }

  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  return (
    <>
      <PageTitle title="Покупатель" />
      <h1 style={{ marginTop: 0 }}>Покупатель</h1>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>
        Каталог товаров. В корзине: <strong>{cartCount}</strong> {cartCount === 1 ? 'товар' : 'товаров'}.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {CATALOG.map((p) => (
          <div key={p.id} className="card">
            <Link to={`/buyer/product/${p.id}`} style={{ fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>{p.name}</Link>
            <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{p.price.toLocaleString('ru-RU')} ₽</p>
            <button type="button" className="btn btn-primary" onClick={() => addToCart(p.id)}>
              В корзину
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>Мои заказы</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {MOCK_ORDERS.map((o) => (
          <div key={o.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong>{o.id}</strong> — {o.date} · {o.items}
            </div>
            <span style={{ marginLeft: '0.5rem' }}>{o.total.toLocaleString('ru-RU')} ₽</span>
            <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.85rem', background: o.status === 'Доставлен' ? '#dcfce7' : '#fef3c7', color: '#334155' }}>{o.status}</span>
          </div>
        ))}
      </div>

      {cartCount > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <strong>Корзина</strong>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', listStyle: 'none' }}>
            {cart.map((c) => {
              const product = CATALOG.find((x) => x.id === c.id)!
              return (
                <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }} onClick={() => changeQty(c.id, -1)}>−</button>
                  <span style={{ minWidth: '2ch' }}>{c.qty}</span>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }} onClick={() => changeQty(c.id, 1)}>+</button>
                  <span>{product.name} — {(product.price * c.qty).toLocaleString('ru-RU')} ₽</span>
                </li>
              )
            })}
          </ul>
          <p style={{ marginTop: '0.5rem' }}>
            Итого: {cart.reduce((s, c) => s + (CATALOG.find((x) => x.id === c.id)!.price * c.qty), 0).toLocaleString('ru-RU')} ₽
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setCart([])} style={{ marginRight: '0.5rem' }}>
            Очистить корзину
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => alert('Оформление заказа будет подключено к бэкенду.')}
          >
            Оформить заказ
          </button>
        </div>
      )}
    </>
  )
}
