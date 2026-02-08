import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { getAISupport } from '../services/geminiService'
import { CATALOG } from '../data/catalog'

export default function ChatView() {
  const [searchParams] = useSearchParams()
  const productId = searchParams.get('product')
  const product = productId ? CATALOG.find((p) => p.id === productId) : null

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return
    setMessages((prev) => [...prev, { role: 'user', text: message.trim() }])
    setMessage('')
    setLoading(true)
    try {
      const reply = await getAISupport(message.trim())
      setMessages((prev) => [...prev, { role: 'ai', text: reply }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageTitle title="Чат" />
      <Link to="/buyer" style={{ display: 'inline-block', marginBottom: '1rem' }}>← Назад</Link>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Чат</h1>
        {product && (
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            По товару: <strong>{product.name}</strong> (Связаться с продавцом / GOGO AI Помощник)
          </p>
        )}
        <div style={{ minHeight: 200, marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 8 }}>
          {messages.length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Напишите вопрос — ответит GOGO AI Помощник (Gemini).</p>}
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: '0.5rem', textAlign: m.role === 'user' ? 'right' : 'left' }}>
              <span style={{ display: 'inline-block', padding: '0.35rem 0.75rem', borderRadius: 8, background: m.role === 'user' ? '#2563eb' : '#e2e8f0', color: m.role === 'user' ? '#fff' : '#334155', maxWidth: '85%' }}>
                {m.text}
              </span>
            </div>
          ))}
          {loading && <p style={{ color: '#64748b', fontSize: '0.85rem' }}>…</p>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Вопрос о платформе или товаре"
            style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
          <button type="button" className="btn btn-primary" onClick={handleSend} disabled={loading}>Отправить</button>
        </div>
      </div>
    </>
  )
}
