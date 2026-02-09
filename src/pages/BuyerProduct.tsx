import { useParams, Link, useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { useTranslation } from '../i18n/useTranslation'
import { useCatalog } from '../context/CatalogContext'
import { useToastContext } from '../context/ToastContext'
import ProductImage from '../components/ProductImage'

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
  const { showToast } = useToastContext()
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
    showToast(`${product.name} добавлен в корзину${qty > 1 ? ` (${qty} шт.)` : ''}`, 'success')
    navigate('/buyer')
  }

  const isFull = product.sellerType === 'FULL'

  return (
    <>
      <PageTitle title={product.name} />
      <Link to="/buyer" className="back-link">← {t('backToCatalog')}</Link>
      <div className="card card-product">
        <div style={{ marginBottom: '1rem', width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9' }}>
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="product-image-placeholder" style={{ display: 'none', position: 'absolute', inset: 0 }}>
            <span style={{ fontSize: '4rem', opacity: 0.3 }}>📦</span>
          </div>
        </div>
        <div className="card-product-header">
          {product.sellerType === 'SIMPLE' && <span className="badge">{t('dealer')}</span>}
          <h1 className="card-product-title">{product.name}</h1>
        </div>
        <p className="card-price">{product.price.toLocaleString('ru-RU')} ₽</p>
        {product.description && <p className="text-muted" style={{ marginBottom: '1rem' }}>{product.description}</p>}
        <div className="card-actions">
          {isFull ? (
            <>
              <button type="button" className="btn btn-primary btn-icon" onClick={() => handleAdd(1)}>
                <span>🛒</span> {t('addToCart')}
              </button>
              <button type="button" className="btn btn-secondary btn-icon" onClick={() => handleAdd(2)}>
                <span>🛒</span> +2 {t('addToCart')}
              </button>
            </>
          ) : (
            <Link to={`/chat?product=${product.id}`} className="btn btn-primary btn-icon">
              <span>💬</span> {t('contact')}
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
