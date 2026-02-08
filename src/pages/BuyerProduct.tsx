import { useParams, Link, useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { CATALOG } from '../data/catalog'

const CART_KEY = 'gogomarket-cart'

function addToCartStorage(id: string, qty: number) {
  try {
    const s = localStorage.getItem(CART_KEY)
    const cart: { id: string; qty: number }[] = s ? JSON.parse(s) : []
    const i = cart.findIndex((c) => c.id === id)
    if (i >= 0) cart[i].qty += qty
    else cart.push({ id, qty })
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
    window.dispatchEvent(new Event('gogomarket-cart-update'))
  } catch {}
}

export default function BuyerProduct() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const product = CATALOG.find((p) => p.id === id)

  if (!product) {
    return (
      <>
        <PageTitle title="Товар не найден" />
        <p>Товар не найден.</p>
        <Link to="/buyer" className="btn btn-secondary">В каталог</Link>
      </>
    )
  }

  const handleAdd = (qty: number) => {
    addToCartStorage(product.id, qty)
    navigate('/buyer')
  }

  return (
    <>
      <PageTitle title={product.name} />
      <Link to="/buyer" style={{ display: 'inline-block', marginBottom: '1rem' }}>← В каталог</Link>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>{product.name}</h1>
        <p style={{ fontSize: '1.25rem', margin: '0.5rem 0' }}>{product.price.toLocaleString('ru-RU')} ₽</p>
        <p style={{ color: '#64748b' }}>{product.description}</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => handleAdd(1)}>В корзину</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleAdd(2)}>+2 в корзину</button>
        </div>
      </div>
    </>
  )
}
