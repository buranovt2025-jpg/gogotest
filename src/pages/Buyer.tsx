import { useState, useEffect } from 'react'
import PageTitle from '../components/PageTitle'

const CATALOG = [
  { id: '1', name: 'Смартфон X', price: 29990 },
  { id: '2', name: 'Наушники Pro', price: 4990 },
  { id: '3', name: 'Чехол универсальный', price: 790 },
]

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
            <strong>{p.name}</strong>
            <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{p.price.toLocaleString('ru-RU')} ₽</p>
            <button type="button" className="btn btn-primary" onClick={() => addToCart(p.id)}>
              В корзину
            </button>
          </div>
        ))}
      </div>

      {cartCount > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <strong>Корзина</strong>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
            {cart.map((c) => {
              const product = CATALOG.find((x) => x.id === c.id)!
              return (
                <li key={c.id}>
                  {product.name} × {c.qty} — {(product.price * c.qty).toLocaleString('ru-RU')} ₽
                </li>
              )
            })}
          </ul>
          <p style={{ marginTop: '0.5rem' }}>
            Итого: {cart.reduce((s, c) => s + (CATALOG.find((x) => x.id === c.id)!.price * c.qty), 0).toLocaleString('ru-RU')} ₽
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setCart([])}>
            Очистить корзину
          </button>
        </div>
      )}
    </>
  )
}
