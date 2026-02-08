import { useState } from 'react'
import PageTitle from '../components/PageTitle'
import { generateProductDescription } from '../lib/gemini'

export default function Seller() {
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

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
          style={{ width: '120px', padding: '0.5rem', marginBottom: '1rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        <br />
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={loading || !productName.trim()}
        >
          {loading ? 'Генерация…' : 'Сгенерировать описание (ИИ)'}
        </button>
      </div>

      {description && (
        <div className="card">
          <strong>Описание товара</strong>
          <p style={{ margin: '0.5rem 0 0', whiteSpace: 'pre-wrap' }}>{description}</p>
        </div>
      )}
    </>
  )
}
