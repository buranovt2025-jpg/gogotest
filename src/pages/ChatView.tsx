import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { useTranslation } from '../i18n/useTranslation'
import { useCatalog } from '../context/CatalogContext'
import { getAISupport } from '../services/geminiService'
import { isApiEnabled } from '../api/client'
import { getSocket } from '../api/ws'

export default function ChatView() {
  const { t } = useTranslation()
  const { catalog } = useCatalog()
  const [searchParams] = useSearchParams()
  const productId = searchParams.get('product')
  const product = productId ? catalog.find((p) => p.id === productId) : null

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [loading, setLoading] = useState(false)

  const room = productId ? `product-${productId}` : 'general'

  useEffect(() => {
    if (!isApiEnabled()) return
    const socket = getSocket()
    if (!socket) return
    socket.emit('join', room)
    const onMsg = (data: { text?: string }) => {
      if (data?.text) setMessages((prev) => [...prev, { role: 'ai', text: data.text }])
    }
    socket.on('message', onMsg)
    return () => {
      socket.off('message', onMsg)
    }
  }, [room])

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
      <PageTitle title={t('chatTitle')} />
      <Link to="/buyer" className="back-link">{t('backLink')}</Link>
      <div className="card">
        <h1 className="page-heading">{t('chatTitle')}</h1>
        {product && (
          <p className="lead" style={{ marginBottom: '1rem' }}>
            {t('chatProduct')}: <strong>{product.name}</strong> ({t('chatProductHint')})
          </p>
        )}
        <div className="chat-area">
          {messages.length === 0 && <p className="chat-hint text-muted">{t('chatHint')}</p>}
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'chat-row chat-row-user' : 'chat-row chat-row-ai'}>
              <span className={m.role === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-ai'}>{m.text}</span>
            </div>
          ))}
          {loading && <p className="text-muted" style={{ fontSize: '0.85rem' }}>…</p>}
        </div>
        <div className="chat-input-row">
          <input
            type="text"
            className="input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chatPlaceholder')}
            aria-label={t('chatPlaceholder')}
          />
          <button type="button" className="btn btn-primary" onClick={handleSend} disabled={loading}>{t('chatSend')}</button>
        </div>
      </div>
    </>
  )
}
