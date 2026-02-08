import { useState, useEffect } from 'react'
import PageTitle from '../components/PageTitle'

const DELIVERY_STATUSES = ['Ожидает', 'В пути', 'Доставлен'] as const
type Status = (typeof DELIVERY_STATUSES)[number]

interface Delivery {
  id: string
  orderId: string
  address: string
  status: Status
}

const STORAGE_KEY = 'gogomarket-courier-deliveries'
const INITIAL: Delivery[] = [
  { id: '1', orderId: '#1001', address: 'ул. Примерная, 10', status: 'В пути' },
  { id: '2', orderId: '#1002', address: 'пр. Тестовый, 5', status: 'Ожидает' },
  { id: '3', orderId: '#1003', address: 'ул. Демо, 3', status: 'Доставлен' },
]

function load(): Delivery[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) return JSON.parse(s)
  } catch {}
  return INITIAL
}

export default function Courier() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries))
  }, [deliveries])

  const setStatus = (id: string, next: Status) => {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: next } : d)))
  }

  const nextStatus = (d: Delivery): Status | null => {
    if (d.status === 'Ожидает') return 'В пути'
    if (d.status === 'В пути') return 'Доставлен'
    return null
  }

  return (
    <>
      <PageTitle title="Курьер" />
      <h1 style={{ marginTop: 0 }}>Курьер</h1>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>Список доставок. Меняйте статус кнопками.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {deliveries.map((d) => {
          const next = nextStatus(d)
          return (
            <div key={d.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <strong>{d.orderId}</strong> — {d.address}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    background: d.status === 'Доставлен' ? '#dcfce7' : d.status === 'В пути' ? '#fef3c7' : '#e2e8f0',
                    color: '#334155',
                  }}
                >
                  {d.status}
                </span>
                {next && (
                  <button type="button" className="btn btn-primary" style={{ fontSize: '0.85rem' }} onClick={() => setStatus(d.id, next)}>
                    {next === 'В пути' ? 'Взять в доставку' : 'Отметить доставленным'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
