import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { useTranslation } from '../i18n/useTranslation'
import { CATALOG } from '../data/catalog'
import { loadOrders, addOrder, openDispute } from '../data/orders'
import type { DisputeReason } from '../types'

const CART_KEY = 'gogomarket-cart'

function loadCart(): { id: string; qty: number }[] {
  try {
    const s = localStorage.getItem(CART_KEY)
    if (s) return JSON.parse(s)
  } catch {}
  return []
}

type BuyerTab = 'catalog' | 'reels'

export default function Buyer() {
  const [cart, setCart] = useState<{ id: string; qty: number }[]>(loadCart)
  const [orders, setOrders] = useState(loadOrders)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<BuyerTab>('catalog')
  const [storyProductId, setStoryProductId] = useState<string | null>(null)
  const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null)
  const [disputeReason, setDisputeReason] = useState<DisputeReason>('damage')
  const [disputeComment, setDisputeComment] = useState('')

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

  const { t } = useTranslation()
  const totalSum = cart.reduce((s, c) => s + (CATALOG.find((x) => x.id === c.id)!.price * c.qty), 0)
  const cartCountNum = cart.reduce((s, c) => s + c.qty, 0)

  const handleCheckout = () => {
    const items = cart
      .filter((c) => CATALOG.find((x) => x.id === c.id)?.sellerType === 'FULL')
      .map((c) => {
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

  const handleOpenDispute = () => {
    if (!disputeOrderId) return
    openDispute(disputeOrderId, disputeReason, disputeComment.trim() || undefined)
    setOrders(loadOrders())
    setDisputeOrderId(null)
    setDisputeComment('')
  }

  const statusBg = (status: string) => {
    if (status === 'Доставлен') return '#dcfce7'
    if (status === 'Отменён') return '#fee2e2'
    if (status === 'Новый') return '#dbeafe'
    return '#fef3c7'
  }

  return (
    <>
      <PageTitle title={t('navBuyer')} />
      <h1 style={{ marginTop: 0 }}>{t('navBuyer')}</h1>
      <p style={{ color: '#64748b', marginBottom: '0.75rem' }}>
        {t('navBuyer')}: <strong>{cartCountNum}</strong> {t('cartCount', { n: cartCountNum })}.
      </p>

      {/* Истории: горизонтальная лента, привязаны к товарам (productId) */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: 4 }}>
        {CATALOG.slice(0, 4).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setStoryProductId(p.id)}
            style={{ flexShrink: 0, width: 56, height: 56, borderRadius: '50%', border: '2px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer', fontSize: 10 }}
            title={p.name}
          >
            {p.name.slice(0, 2)}
          </button>
        ))}
      </div>
      {storyProductId && (
        <div className="card" style={{ position: 'relative', marginBottom: '1rem' }}>
          <strong>История</strong> — товар: {CATALOG.find((p) => p.id === storyProductId)?.name}
          <Link to={`/buyer/product/${storyProductId}`} className="btn btn-primary" style={{ marginLeft: '0.5rem' }}>Перейти</Link>
          <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.25rem' }} onClick={() => setStoryProductId(null)}>Закрыть</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button type="button" className={activeTab === 'catalog' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('catalog')}>{t('catalog')}</button>
        <button type="button" className={activeTab === 'reels' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('reels')}>{t('reels')}</button>
      </div>

      {activeTab === 'reels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Вертикальный скролл (Snap), каждый рилс привязан к товару (productId).</p>
          {CATALOG.map((p) => (
            <div key={p.id} className="card" style={{ minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)' }}>
              <div style={{ padding: '1rem', color: '#fff' }}>
                <strong>{p.name}</strong> — {p.price.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ padding: '0 1rem 1rem', display: 'flex', gap: '0.5rem' }}>
                {p.sellerType === 'FULL' ? (
                  <button type="button" className="btn btn-primary" onClick={() => addToCart(p.id)}>{t('addToCart')}</button>
                ) : (
                  <Link to={`/chat?product=${p.id}`} className="btn btn-primary">{t('contact')}</Link>
                )}
                <Link to={`/buyer/product/${p.id}`} className="btn btn-secondary">...</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'catalog' && (
        <>
      <input
        type="search"
        placeholder={t('searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', maxWidth: 320, padding: '0.5rem 0.75rem', marginBottom: '1rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
        aria-label="Поиск по каталогу"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {filteredCatalog.map((p) => (
          <div key={p.id} className="card">
            <div style={{ marginBottom: '0.25rem' }}>
              {p.sellerType === 'SIMPLE' && <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: 4, marginRight: '0.5rem' }}>{t('dealer')}</span>}
              <Link to={`/buyer/product/${p.id}`} style={{ fontWeight: 600, display: 'inline-block' }}>{p.name}</Link>
            </div>
            <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{p.price.toLocaleString('ru-RU')} ₽</p>
            {p.sellerType === 'FULL' ? (
              <button type="button" className="btn btn-primary" onClick={() => addToCart(p.id)}>{t('addToCart')}</button>
            ) : (
              <Link to={`/chat?product=${p.id}`} className="btn btn-secondary">{t('contact')}</Link>
            )}
          </div>
        ))}
      </div>
      {filteredCatalog.length === 0 && <p style={{ color: '#64748b' }}>Ничего не найдено.</p>}
        </>
      )}

      <h2 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>{t('myOrders')}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {orders.map((o) => (
          <div key={o.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong>{o.id}</strong> — {o.date} · {o.items}
            </div>
            <span style={{ marginLeft: '0.5rem' }}>{o.total.toLocaleString('ru-RU')} ₽</span>
            <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.85rem', background: statusBg(o.status), color: '#334155' }}>{o.status}</span>
            {o.disputeStatus === 'open' && <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.85rem', background: '#fef3c7', color: '#92400e' }}>Спор открыт</span>}
            {o.disputeStatus !== 'open' && !o.disputeResolvedAt && (
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => setDisputeOrderId(o.id)}>Открыть спор</button>
            )}
          </div>
        ))}
      </div>

      {disputeOrderId && (
        <div className="card" style={{ marginTop: '1rem', border: '2px solid #2563eb' }}>
          <strong>Открытие спора</strong> (заказ {disputeOrderId})
          <label style={{ display: 'block', marginTop: '0.5rem', fontWeight: 600 }}>Причина</label>
          <select value={disputeReason} onChange={(e) => setDisputeReason(e.target.value as DisputeReason)} style={{ padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}>
            <option value="damage">Повреждение товара</option>
            <option value="courier_no_show">Курьер не приехал</option>
            <option value="wrong_item">Не тот товар</option>
            <option value="other">Другое</option>
          </select>
          <label style={{ display: 'block', fontWeight: 600 }}>Комментарий</label>
          <input type="text" value={disputeComment} onChange={(e) => setDisputeComment(e.target.value)} placeholder="Опишите проблему" style={{ width: '100%', maxWidth: 400, padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }} />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-primary" onClick={handleOpenDispute}>Отправить</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setDisputeOrderId(null); setDisputeComment('') }}>Отмена</button>
          </div>
        </div>
      )}

      {cartCountNum > 0 && (
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
            {t('total')}: {totalSum.toLocaleString('ru-RU')} ₽
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setCart([])} style={{ marginRight: '0.5rem' }}>
            {t('clearCart')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCheckout}>
            {t('checkout')}
          </button>
        </div>
      )}
    </>
  )
}
