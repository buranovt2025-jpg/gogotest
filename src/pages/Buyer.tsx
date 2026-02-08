import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { CATALOG } from '../data/catalog'
import { loadOrders, addOrder } from '../data/orders'

const CART_KEY = 'gogomarket-cart'

function loadCart(): { id: string; qty: number }[] {
  try {
    const s = localStorage.getItem(CART_KEY)
    if (s) return JSON.parse(s)
  } catch {}
  return []
}

export default function Buyer() {
  const [cart, setCart] = useState<{ id: string; qty: number }[]>(loadCart)
  const [orders, setOrders] = useState(loadOrders)
  const [search, setSearch] = useState('')

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
    window.dispatchEvent(new Event('gogomarket-cart-update'))
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

  const totalSum = cart.reduce((s, c) => s + (CATALOG.find((x) => x.id === c.id)!.price * c.qty), 0)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  const handleCheckout = () => {
    const items = cart.map((c) => {
      const p = CATALOG.find((x) => x.id === c.id)!
      return `${p.name} × ${c.qty}`
    }).join(', ')
    addOrder({ total: totalSum, status: 'Новый', items })
    setOrders(loadOrders())
    setCart([])
  }

  const filteredCatalog = search.trim()
    ? CATALOG.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : CATALOG

  const statusBg = (status: string) => {
    if (status === 'Доставлен') return '#dcfce7'
    if (status === 'Отменён') return '#fee2e2'
    if (status === 'Новый') return '#dbeafe'
    return '#fef3c7'
  }

  return (
    <>
      <PageTitle title="Покупатель" />
      <h1 style={{ marginTop: 0 }}>Покупатель</h1>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>
        Каталог товаров. В корзине: <strong>{cartCount}</strong> {cartCount === 1 ? 'товар' : 'товаров'}.
      </p>

      <input
        type="search"
        placeholder="Поиск по названию..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', maxWidth: 320, padding: '0.5rem 0.75rem', marginBottom: '1rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
        aria-label="Поиск по каталогу"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {filteredCatalog.map((p) => (
          <div key={p.id} className="card">
            <Link to={`/buyer/product/${p.id}`} style={{ fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>{p.name}</Link>
            <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{p.price.toLocaleString('ru-RU')} ₽</p>
            <button type="button" className="btn btn-primary" onClick={() => addToCart(p.id)}>
              В корзину
            </button>
          </div>
        ))}
      </div>
      {filteredCatalog.length === 0 && <p style={{ color: '#64748b' }}>Ничего не найдено.</p>}

      <h2 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>Мои заказы</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {orders.map((o) => (
          <div key={o.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong>{o.id}</strong> — {o.date} · {o.items}
            </div>
            <span style={{ marginLeft: '0.5rem' }}>{o.total.toLocaleString('ru-RU')} ₽</span>
            <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.85rem', background: statusBg(o.status), color: '#334155' }}>{o.status}</span>
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
            Итого: {totalSum.toLocaleString('ru-RU')} ₽
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setCart([])} style={{ marginRight: '0.5rem' }}>
            Очистить корзину
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCheckout}>
            Оформить заказ
          </button>
        </div>
      )}
    </>
  )
}
