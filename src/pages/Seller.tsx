import { useState, useEffect } from 'react'
import PageTitle from '../components/PageTitle'
import { UserRole } from '../types'
import type { SimpleCategory } from '../types'
import { generateAIDescription } from '../services/geminiService'
import { loadSellerProducts, saveSellerProducts, type SellerProduct } from '../data/sellerProducts'

const SIMPLE_CATEGORIES: { value: SimpleCategory; label: string }[] = [
  { value: 'auto', label: 'Авто' },
  { value: 'realty', label: 'Недвижимость' },
  { value: 'services', label: 'Услуги' },
]

export default function Seller() {
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

  useEffect(() => {
    setMyProducts(loadSellerProducts())
  }, [])

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

  return (
    <>
      <PageTitle title="Продавец" />
      <h1 style={{ marginTop: 0 }}>Продавец</h1>
      <p style={{ color: '#64748b', marginBottom: '0.75rem' }}>
        {isSimple ? 'Объявления: авто, недвижимость, услуги.' : 'Инвентарь интернет-магазина. Описание через ИИ (Gemini).'}
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          type="button"
          className={!isSimple ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setRole(UserRole.SELLER_FULL)}
        >
          Инвентарь (магазин)
        </button>
        <button
          type="button"
          className={isSimple ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setRole(UserRole.SELLER_SIMPLE)}
        >
          Объявления
        </button>
      </div>

      <div className="card">
        {editingId && <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#64748b' }}>Редактирование</p>}
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Название</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder={isSimple ? 'Например: Toyota Camry' : 'Беспроводные наушники'}
          style={{ width: '100%', maxWidth: 400, padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        {isSimple && (
          <>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Категория</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SimpleCategory)}
              style={{ padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
            >
              {SIMPLE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {category === 'auto' && (
              <>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Пробег (км)</label>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Площадь (м²)</label>
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
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Цена (₽)</label>
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Описание</label>
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
              {loading ? 'Генерация…' : 'Сгенерировать описание (ИИ)'}
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={handleSaveProduct} disabled={!productName.trim()}>
            {editingId ? 'Сохранить' : isSimple ? 'Добавить объявление' : 'Добавить товар'}
          </button>
          {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Отмена</button>}
        </div>
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>{isSimple ? 'Мои объявления' : 'Мои товары'}</h2>
      {myProducts.length === 0 ? (
        <p style={{ color: '#64748b' }}>Пока ничего нет.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {myProducts.map((p) => (
            <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                {p.sellerType === 'SIMPLE' && <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: 4, marginRight: '0.5rem' }}>Dealer</span>}
                <strong>{p.name}</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>{Number(p.price) > 0 ? `${Number(p.price).toLocaleString('ru-RU')} ₽` : '— ₽'}</p>
                {p.category && <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{SIMPLE_CATEGORIES.find((c) => c.value === p.category)?.label}</span>}
                {p.description && <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>{p.description.slice(0, 100)}{p.description.length > 100 ? '…' : ''}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => startEdit(p)}>Редактировать</button>
                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => handleRemove(p.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
