import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { useTranslation } from '../i18n/useTranslation'
import { useCatalog } from '../context/CatalogContext'
import { useOrders } from '../hooks/useOrders'
import { useAuth } from '../context/AuthContext'
import { isApiEnabled, apiOrderTracks } from '../api/client'
import type { DisputeReason } from '../types'
import { useTracking } from '../hooks/useTracking'
import TrackingMap from '../components/TrackingMap'

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
  const navigate = useNavigate()
  const { catalog, loading: catalogLoading, error: catalogError } = useCatalog()
  const { orders, addOrder, openDispute } = useOrders()
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<{ id: string; qty: number }[]>(loadCart)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<BuyerTab>('catalog')
  const [storyProductId, setStoryProductId] = useState<string | null>(null)
  const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null)
  const [disputeReason, setDisputeReason] = useState<DisputeReason>('damage')
  const [disputeComment, setDisputeComment] = useState('')
  const [trackOrderId, setTrackOrderId] = useState<string | null>(null)
  const [trackHistory, setTrackHistory] = useState<{ lat: number; lng: number; at: string }[] | null>(null)
  const { lat: trackLat, lng: trackLng } = useTracking(trackOrderId)

  useEffect(() => {
    if (!trackOrderId || !isApiEnabled()) return
    setTrackHistory(null)
    apiOrderTracks(trackOrderId).then(setTrackHistory).catch(() => setTrackHistory([]))
  }, [trackOrderId])

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
  const totalSum = cart.reduce((s, c) => s + (catalog.find((x) => x.id === c.id)?.price ?? 0) * c.qty, 0)
  const cartCountNum = cart.reduce((s, c) => s + c.qty, 0)

  const handleCheckout = () => {
    if (isApiEnabled() && !isAuthenticated) {
      navigate('/login')
      return
    }
    const items = cart
      .filter((c) => catalog.find((x) => x.id === c.id)?.sellerType === 'FULL')
      .map((c) => {
        const p = catalog.find((x) => x.id === c.id)!
        return `${p.name} × ${c.qty}`
      }).join(', ')
    addOrder({ total: totalSum, status: 'Новый', items })
    setCart([])
  }

  const filteredCatalog = search.trim()
    ? catalog.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : catalog

  const handleOpenDispute = () => {
    if (!disputeOrderId) return
    if (isApiEnabled() && !isAuthenticated) {
      navigate('/login')
      return
    }
    openDispute(disputeOrderId, disputeReason, disputeComment.trim() || undefined)
    setDisputeOrderId(null)
    setDisputeComment('')
  }

  const openDisputeClick = (orderId: string) => {
    if (isApiEnabled() && !isAuthenticated) {
      navigate('/login')
      return
    }
    setDisputeOrderId(orderId)
  }

  const statusBg = (status: string) => {
    if (status === 'Доставлен') return '#dcfce7'
    if (status === 'Отменён') return '#fee2e2'
    if (status === 'Новый') return '#dbeafe'
    return '#fef3c7'
  }

  const orderStatusLabel = (status: string) => {
    const key: Record<string, string> = {
      'Новый': 'orderStatusNew',
      'Подтверждён': 'orderStatusConfirmed',
      'В пути': 'statusEnRoute',
      'Доставлен': 'orderStatusDelivered',
      'Отменён': 'orderStatusCancelled',
    }
    return key[status] ? t(key[status] as 'orderStatusNew' | 'orderStatusConfirmed' | 'statusEnRoute' | 'orderStatusDelivered' | 'orderStatusCancelled') : status
  }

  return (
    <>
      <PageTitle title={t('navBuyer')} />
      <h1 style={{ marginTop: 0 }}>{t('navBuyer')}</h1>
      {catalogLoading && <p style={{ color: '#64748b' }}>{t('loading')}</p>}
      {catalogError && <p style={{ color: '#dc2626' }}>{catalogError.message}</p>}
      <p style={{ color: '#64748b', marginBottom: '0.75rem' }}>
        {t('navBuyer')}: <strong>{cartCountNum}</strong> {t('cartCount', { n: cartCountNum })}.
      </p>

      {/* Истории: горизонтальная лента, привязаны к товарам (productId) */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: 4 }}>
        {catalog.slice(0, 4).map((p) => (
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
          <strong>{t('storyTitle')}</strong> — {catalog.find((p) => p.id === storyProductId)?.name}
          <Link to={`/buyer/product/${storyProductId}`} className="btn btn-primary" style={{ marginLeft: '0.5rem' }}>{t('goTo')}</Link>
          <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.25rem' }} onClick={() => setStoryProductId(null)}>{t('close')}</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button type="button" className={activeTab === 'catalog' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('catalog')}>{t('catalog')}</button>
        <button type="button" className={activeTab === 'reels' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('reels')}>{t('reels')}</button>
      </div>

      {activeTab === 'reels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{t('reelsHint')}</p>
          {catalog.map((p) => (
            <div key={p.id} className="card" style={{ minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: p.imageUrl || p.videoUrl ? undefined : 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)', overflow: 'hidden', position: 'relative' }}>
              {p.videoUrl ? (
                <video src={p.videoUrl} autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
              ) : p.imageUrl ? (
                <img src={p.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
              ) : null}
              <div style={{ position: 'relative', zIndex: 1, padding: '1rem', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                <strong>{p.name}</strong> — {p.price.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ position: 'relative', zIndex: 1, padding: '0 1rem 1rem', display: 'flex', gap: '0.5rem' }}>
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
        aria-label={t('searchPlaceholder')}
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
      {filteredCatalog.length === 0 && <p style={{ color: '#64748b' }}>{t('noResults')}</p>}
        </>
      )}

      {isApiEnabled() && !isAuthenticated && (
        <p style={{ marginTop: '1.5rem', padding: '0.75rem', background: '#fef3c7', borderRadius: 8, fontSize: '0.9rem' }}>
          {t('authRequired')} <Link to="/login">{t('login')}</Link>
        </p>
      )}
      <h2 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>{t('myOrders')}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {orders.map((o) => (
          <div key={o.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong>{o.id}</strong> — {o.date} · {o.items}
            </div>
            <span style={{ marginLeft: '0.5rem' }}>{o.total.toLocaleString('ru-RU')} ₽</span>
            <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.85rem', background: statusBg(o.status), color: '#334155' }}>{orderStatusLabel(o.status)}</span>
            {o.disputeStatus === 'open' && <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.85rem', background: '#fef3c7', color: '#92400e' }}>{t('disputeOpen')}</span>}
            {o.disputeStatus !== 'open' && !o.disputeResolvedAt && (
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => openDisputeClick(o.id)}>{t('openDisputeBtn')}</button>
            )}
            {isApiEnabled() && o.status === 'В пути' && (
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => setTrackOrderId(o.id)}>{t('trackOrder')}</button>
            )}
          </div>
        ))}
      </div>

      {trackOrderId && isApiEnabled() && (() => {
        const order = orders.find((o) => o.id === trackOrderId)
        return (
          <div className="card" style={{ marginTop: '1rem' }}>
            <strong>{t('trackOrder')}</strong> — {trackOrderId}
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.25rem 0 0.5rem' }}>{t('trackOrderHint')}</p>
            <TrackingMap
              lat={trackLat}
              lng={trackLng}
              initialLat={order?.lastCourierLat ?? null}
              initialLng={order?.lastCourierLng ?? null}
              tracks={trackHistory ?? undefined}
              height={260}
            />
            <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setTrackOrderId(null)}>{t('close')}</button>
          </div>
        )
      })()}

      {disputeOrderId && (
        <div className="card" style={{ marginTop: '1rem', border: '2px solid #2563eb' }}>
          <strong>{t('disputeFormTitle')}</strong> ({disputeOrderId})
          <label style={{ display: 'block', marginTop: '0.5rem', fontWeight: 600 }}>{t('disputeReasonLabel')}</label>
          <select value={disputeReason} onChange={(e) => setDisputeReason(e.target.value as DisputeReason)} style={{ padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}>
            <option value="damage">{t('disputeDamage')}</option>
            <option value="courier_no_show">{t('disputeCourierNoShow')}</option>
            <option value="wrong_item">{t('disputeWrongItem')}</option>
            <option value="other">{t('disputeOther')}</option>
          </select>
          <label style={{ display: 'block', fontWeight: 600 }}>{t('disputeCommentLabel')}</label>
          <input type="text" value={disputeComment} onChange={(e) => setDisputeComment(e.target.value)} placeholder={t('disputeCommentPlaceholder')} style={{ width: '100%', maxWidth: 400, padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }} />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-primary" onClick={handleOpenDispute}>{t('chatSend')}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setDisputeOrderId(null); setDisputeComment('') }}>{t('cancel')}</button>
          </div>
        </div>
      )}

      {cartCountNum > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <strong>{t('cartTitle')}</strong>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', listStyle: 'none' }}>
            {cart.map((c) => {
const product = catalog.find((x) => x.id === c.id)
                return (
                  <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }} onClick={() => changeQty(c.id, -1)}>−</button>
                    <span style={{ minWidth: '2ch' }}>{c.qty}</span>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }} onClick={() => changeQty(c.id, 1)}>+</button>
                    <span>{product?.name ?? c.id} — {((product?.price ?? 0) * c.qty).toLocaleString('ru-RU')} ₽</span>
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
