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
        <div className="empty-state">
          <p>{t('productNotFound')}.</p>
          <Link to="/buyer" className="btn btn-secondary">{t('backToCatalog')}</Link>
        </div>
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
      <Link to="/buyer" className="back-link">← {t('backToCatalog')}</Link>
      <div className="card card-product">
        <div className="card-product-header">
          {product.sellerType === 'SIMPLE' && <span className="badge">{t('dealer')}</span>}
          <h1 className="card-product-title">{product.name}</h1>
        </div>
        <p className="card-price">{product.price.toLocaleString('ru-RU')} ₽</p>
        <p className="text-muted">{product.description}</p>
        <div className="card-actions">
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
