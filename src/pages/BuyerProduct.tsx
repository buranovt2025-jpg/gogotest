import { useParams, Link, useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { useTranslation } from '../i18n/useTranslation'
import { useCatalog } from '../context/CatalogContext'

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
  const { t } = useTranslation()
  const { catalog } = useCatalog()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const product = catalog.find((p) => p.id === id)

  if (!product) {
    return (
      <>
        <PageTitle title={t('productNotFound')} />
        <p>{t('productNotFound')}.</p>
        <Link to="/buyer" className="btn btn-secondary">{t('backToCatalog')}</Link>
      </>
    )
  }

  const handleAdd = (qty: number) => {
    addToCartStorage(product.id, qty)
    navigate('/buyer')
  }

  const isFull = product.sellerType === 'FULL'

  return (
    <>
      <PageTitle title={product.name} />
      <Link to="/buyer" style={{ display: 'inline-block', marginBottom: '1rem' }}>← {t('backToCatalog')}</Link>
      <div className="card">
        <div style={{ marginBottom: '0.5rem' }}>
          {product.sellerType === 'SIMPLE' && <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: 4, marginRight: '0.5rem' }}>{t('dealer')}</span>}
          <h1 style={{ marginTop: 0, display: 'inline' }}>{product.name}</h1>
        </div>
        <p style={{ fontSize: '1.25rem', margin: '0.5rem 0' }}>{product.price.toLocaleString('ru-RU')} ₽</p>
        <p style={{ color: '#64748b' }}>{product.description}</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isFull ? (
            <>
              <button type="button" className="btn btn-primary" onClick={() => handleAdd(1)}>{t('addToCart')}</button>
              <button type="button" className="btn btn-secondary" onClick={() => handleAdd(2)}>+2 {t('addToCart')}</button>
            </>
          ) : (
            <Link to={`/chat?product=${product.id}`} className="btn btn-primary">{t('contact')}</Link>
          )}
        </div>
      </div>
    </>
  )
}
