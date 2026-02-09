import { useState, useEffect, useCallback } from 'react'
import PageTitle from '../components/PageTitle'
import { useTranslation } from '../i18n/useTranslation'
import { useAuth } from '../context/AuthContext'
import { isApiEnabled } from '../api/client'
import { apiNewOrdersForSeller, apiConfirmOrder, apiUploadMedia, apiCreateProduct } from '../api/client'
import { useCatalog } from '../context/CatalogContext'
import { UserRole } from '../types'
import type { SimpleCategory } from '../types'
import { generateAIDescription } from '../services/geminiService'
import { loadSellerProducts, saveSellerProducts, type SellerProduct } from '../data/sellerProducts'

const SIMPLE_CATEGORY_KEYS: { value: SimpleCategory; key: 'categoryAuto' | 'categoryRealty' | 'categoryServices' }[] = [
  { value: 'auto', key: 'categoryAuto' },
  { value: 'realty', key: 'categoryRealty' },
  { value: 'services', key: 'categoryServices' },
]

export default function Seller() {
  const { t } = useTranslation()
  /** Режим продавца: SELLER_FULL = инвентарь магазина, SELLER_SIMPLE = объявления (дилер). */
  const [role, setRole] = useState<UserRole>(UserRole.SELLER_FULL)
  const isSimple = role === UserRole.SELLER_SIMPLE

  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<SimpleCategory>('auto')
  const [mileage, setMileage] = useState('')
  const [area, setArea] = useState('')
  const [loading, setLoading] = useState(false)
  const [myProducts, setMyProducts] = useState<SellerProduct[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()
  const [newOrders, setNewOrders] = useState<{ id: string; date: string; total: number; status: string; items: string }[]>([])
  const isSellerRole = user?.role === 'SELLER_FULL' || user?.role === 'SELLER_SIMPLE'
  const { refetch: refetchCatalog } = useCatalog()

  const [catalogName, setCatalogName] = useState('')
  const [catalogPrice, setCatalogPrice] = useState('')
  const [catalogDesc, setCatalogDesc] = useState('')
  const [catalogSellerType, setCatalogSellerType] = useState<'FULL' | 'SIMPLE'>('FULL')
  const [catalogImageFile, setCatalogImageFile] = useState<File | null>(null)
  const [catalogVideoFile, setCatalogVideoFile] = useState<File | null>(null)
  const [catalogSubmitting, setCatalogSubmitting] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  const fetchNewOrders = useCallback(() => {
    if (!isApiEnabled() || !isAuthenticated || !isSellerRole) return
    apiNewOrdersForSeller().then(setNewOrders).catch(() => setNewOrders([]))
  }, [isAuthenticated, isSellerRole])

  useEffect(() => {
    setMyProducts(loadSellerProducts())
  }, [])

  useEffect(() => {
    fetchNewOrders()
  }, [fetchNewOrders])

  const startEdit = (p: SellerProduct) => {
    setEditingId(p.id)
    setProductName(p.name)
    setPrice(p.price)
    setDescription(p.description)
    setCategory(p.category || 'auto')
    setMileage(p.mileage || '')
    setArea(p.area || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setProductName('')
    setPrice('')
    setDescription('')
    setCategory('auto')
    setMileage('')
    setArea('')
  }

  const handleGenerate = async () => {
    if (!productName.trim()) return
    setLoading(true)
    setDescription('')
    try {
      const text = await generateAIDescription(productName.trim(), isSimple ? category : undefined)
      setDescription(text)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProduct = () => {
    if (!productName.trim()) return
    const base = {
      name: productName.trim(),
      price: price.trim() || '0',
      description: description.trim(),
      sellerType: isSimple ? 'SIMPLE' as const : 'FULL' as const,
      ...(isSimple && { category, mileage: mileage.trim() || undefined, area: area.trim() || undefined }),
    }
    if (editingId) {
      const next = myProducts.map((p) =>
        p.id === editingId ? { ...p, ...base } : p
      )
      setMyProducts(next)
      saveSellerProducts(next)
      cancelEdit()
    } else {
      const newProduct: SellerProduct = {
        ...base,
        id: `p-${Date.now()}`,
        createdAt: Date.now(),
      }
      const next = [newProduct, ...myProducts]
      setMyProducts(next)
      saveSellerProducts(next)
      setProductName('')
      setPrice('')
      setDescription('')
      setMileage('')
      setArea('')
    }
  }

  const handleRemove = (id: string) => {
    const next = myProducts.filter((p) => p.id !== id)
    setMyProducts(next)
    saveSellerProducts(next)
  }

  const handleAddToCatalog = async () => {
    if (!catalogName.trim()) return
    setCatalogError(null)
    setCatalogSubmitting(true)
    try {
      let imageUrl: string | undefined
      let videoUrl: string | undefined
      if (catalogImageFile) {
        const res = await apiUploadMedia(catalogImageFile)
        imageUrl = res.url
      }
      if (catalogVideoFile) {
        const res = await apiUploadMedia(catalogVideoFile)
        videoUrl = res.url
      }
      await apiCreateProduct({
        name: catalogName.trim(),
        price: Number(catalogPrice) || 0,
        description: catalogDesc.trim() || undefined,
        sellerType: catalogSellerType,
        imageUrl: imageUrl ?? null,
        videoUrl: videoUrl ?? null,
      })
      refetchCatalog()
      setCatalogName('')
      setCatalogPrice('')
      setCatalogDesc('')
      setCatalogImageFile(null)
      setCatalogVideoFile(null)
    } catch (e) {
      setCatalogError(e instanceof Error ? e.message : String(e))
    } finally {
      setCatalogSubmitting(false)
    }
  }

  return (
    <>
      <PageTitle title={t('navSeller')} />
      <section className="hero">
        <h1>{t('navSeller')}</h1>
        <p className="lead">{isSimple ? t('sellerSubtitleSimple') : t('sellerSubtitleFull')}</p>
      </section>

      <div className="tabs-row" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={!isSimple ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setRole(UserRole.SELLER_FULL)}
        >
          {t('sellerInventory')}
        </button>
        <button
          type="button"
          className={isSimple ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setRole(UserRole.SELLER_SIMPLE)}
        >
          {t('sellerAds')}
        </button>
      </div>

      {isApiEnabled() && isAuthenticated && isSellerRole && (
        <>
          <h2 style={{ marginBottom: '0.75rem' }}>{t('newOrders')}</h2>
          {newOrders.length === 0 ? (
            <div className="empty-state" style={{ marginBottom: '1.5rem' }}><p>{t('noProducts')}</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {newOrders.map((o) => (
                <div key={o.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <strong>{o.id}</strong> — {o.date} · {o.items}
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.95rem' }}>{Number(o.total).toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <button type="button" className="btn btn-primary" style={{ fontSize: '0.85rem' }} onClick={() => apiConfirmOrder(o.id).then(() => fetchNewOrders())}>
                    {t('confirmOrder')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isApiEnabled() && isAuthenticated && isSellerRole && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '0.75rem' }}>{t('addToCatalog')}</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>{t('addToCatalogHint')}</p>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('productName')}</label>
          <input
            type="text"
            value={catalogName}
            onChange={(e) => setCatalogName(e.target.value)}
            style={{ width: '100%', maxWidth: 400, padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('price')}</label>
          <input
            type="number"
            min="0"
            value={catalogPrice}
            onChange={(e) => setCatalogPrice(e.target.value)}
            style={{ width: 120, padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('description')}</label>
          <textarea
            value={catalogDesc}
            onChange={(e) => setCatalogDesc(e.target.value)}
            rows={2}
            style={{ width: '100%', maxWidth: 400, padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('sellerType')}</label>
          <select
            value={catalogSellerType}
            onChange={(e) => setCatalogSellerType(e.target.value as 'FULL' | 'SIMPLE')}
            style={{ padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
          >
            <option value="FULL">{t('sellerInventory')}</option>
            <option value="SIMPLE">{t('sellerAds')}</option>
          </select>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('reelImage')}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCatalogImageFile(e.target.files?.[0] ?? null)}
            style={{ marginBottom: '0.5rem' }}
          />
          {catalogImageFile && <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>↳ {catalogImageFile.name}</p>}
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('reelVideo')}</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setCatalogVideoFile(e.target.files?.[0] ?? null)}
            style={{ marginBottom: '0.5rem' }}
          />
          {catalogVideoFile && <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>↳ {catalogVideoFile.name}</p>}
          {catalogError && <p style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{catalogError}</p>}
          <button type="button" className="btn btn-primary" onClick={handleAddToCatalog} disabled={catalogSubmitting || !catalogName.trim()}>
            {catalogSubmitting ? '…' : t('addToCatalog')}
          </button>
        </div>
      )}

      <div className="card">
        {editingId && <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#64748b' }}>{t('edit')}</p>}
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('productName')}</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder={isSimple ? 'Например: Toyota Camry' : 'Беспроводные наушники'}
          style={{ width: '100%', maxWidth: 400, padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        {isSimple && (
          <>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SimpleCategory)}
              style={{ padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
            >
              {SIMPLE_CATEGORY_KEYS.map((c) => (
                <option key={c.value} value={c.value}>{t(c.key)}</option>
              ))}
            </select>
            {category === 'auto' && (
              <>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('mileage')}</label>
                <input
                  type="text"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="100 000"
                  style={{ width: 120, padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </>
            )}
            {category === 'realty' && (
              <>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('area')}</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="65"
                  style={{ width: 120, padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </>
            )}
          </>
        )}
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('price')}</label>
        <input
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0"
          style={{ width: '120px', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        {description && (
          <>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('description')}</label>
            <p style={{ margin: '0 0 0.5rem', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{description}</p>
          </>
        )}
        {!isSimple && (
          <div style={{ marginBottom: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading || !productName.trim()}
            >
              {loading ? '…' : t('generateDesc')}
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={handleSaveProduct} disabled={!productName.trim()}>
            {editingId ? t('save') : isSimple ? t('addAd') : t('addProduct')}
          </button>
          {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>{t('cancel')}</button>}
        </div>
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>{isSimple ? t('myAds') : t('myProducts')}</h2>
      {myProducts.length === 0 ? (
        <p style={{ color: '#64748b' }}>{t('noProducts')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {myProducts.map((p) => (
            <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                {p.sellerType === 'SIMPLE' && <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: 4, marginRight: '0.5rem' }}>{t('dealer')}</span>}
                <strong>{p.name}</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>{Number(p.price) > 0 ? `${Number(p.price).toLocaleString('ru-RU')} ₽` : '— ₽'}</p>
                {p.category && (() => { const cat = SIMPLE_CATEGORY_KEYS.find((x) => x.value === p.category); return cat ? <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{t(cat.key)}</span> : null; })()}
                {p.description && <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>{p.description.slice(0, 100)}{p.description.length > 100 ? '…' : ''}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => startEdit(p)}>{t('edit')}</button>
                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => handleRemove(p.id)}>{t('remove')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
