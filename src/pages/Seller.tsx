import { useState, useEffect } from 'react'
import PageTitle from '../components/PageTitle'
import { generateProductDescription } from '../lib/gemini'
import { loadSellerProducts, saveSellerProducts, type SellerProduct } from '../data/sellerProducts'

export default function Seller() {
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [myProducts, setMyProducts] = useState<SellerProduct[]>([])

  useEffect(() => {
    setMyProducts(loadSellerProducts())
  }, [])

  const handleGenerate = async () => {
    if (!productName.trim()) return
    setLoading(true)
    setDescription('')
    try {
      const text = await generateProductDescription(productName.trim())
      setDescription(text)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    if (!productName.trim()) return
    const newProduct: SellerProduct = {
      id: `p-${Date.now()}`,
      name: productName.trim(),
      price: price.trim() || '0',
      description: description.trim(),
      createdAt: Date.now(),
    }
    const next = [newProduct, ...myProducts]
    setMyProducts(next)
    saveSellerProducts(next)
    setProductName('')
    setPrice('')
    setDescription('')
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
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>Добавьте товар. Описание можно сгенерировать через ИИ (Gemini).</p>

      <div className="card">
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Название товара</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Например: Беспроводные наушники"
          style={{ width: '100%', maxWidth: 400, padding: '0.5rem', marginBottom: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading || !productName.trim()}
          >
            {loading ? 'Генерация…' : 'Сгенерировать описание (ИИ)'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddProduct}
            disabled={!productName.trim()}
          >
            Добавить товар
          </button>
        </div>
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>Мои товары</h2>
      {myProducts.length === 0 ? (
        <p style={{ color: '#64748b' }}>Пока нет товаров. Добавьте первый выше.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {myProducts.map((p) => (
            <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <strong>{p.name}</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>{Number(p.price) > 0 ? `${Number(p.price).toLocaleString('ru-RU')} ₽` : '— ₽'}</p>
                {p.description && <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{p.description.slice(0, 120)}{p.description.length > 120 ? '…' : ''}</p>}
              </div>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => handleRemove(p.id)}>Удалить</button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
