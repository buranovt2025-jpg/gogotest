import { useState, useEffect } from 'react'
import PageTitle from '../components/PageTitle'
import { loadOrdersWithDisputes, resolveDispute } from '../data/orders'
import type { Order } from '../data/orders'
import type { DisputeResolution } from '../types'

const STATS = [
  { label: 'Заказов за месяц', value: 124 },
  { label: 'Пользователей', value: 89 },
  { label: 'Товаров в каталоге', value: 56 },
]

const MOCK_USERS = [
  { id: '1', email: 'buyer@example.com', role: 'Покупатель', active: true },
  { id: '2', email: 'seller@example.com', role: 'Продавец', active: true },
  { id: '3', email: 'courier@example.com', role: 'Курьер', active: true },
  { id: '4', email: 'support@example.com', role: 'Покупатель', active: false },
]

const DISPUTE_REASON_LABEL: Record<string, string> = {
  damage: 'Повреждение товара',
  courier_no_show: 'Курьер не приехал',
  wrong_item: 'Не тот товар',
  other: 'Другое',
}

const DISPUTE_DEADLINE_HOURS = 48

function getHoursLeft(openedAt: string | null | undefined): number | null {
  if (!openedAt) return null
  const opened = new Date(openedAt).getTime()
  const deadline = opened + DISPUTE_DEADLINE_HOURS * 60 * 60 * 1000
  const now = Date.now()
  const left = (deadline - now) / (60 * 60 * 1000)
  return left <= 0 ? 0 : Math.round(left * 10) / 10
}

type AdminTab = 'stats' | 'users' | 'disputes'

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('stats')
  const [disputes, setDisputes] = useState<Order[]>([])

  useEffect(() => {
    if (activeTab === 'disputes') setDisputes(loadOrdersWithDisputes())
  }, [activeTab])

  const handleResolve = (orderId: string, resolution: DisputeResolution) => {
    if (!resolution) return
    resolveDispute(orderId, resolution, 'admin-1')
    setDisputes(loadOrdersWithDisputes())
  }

  return (
    <>
      <PageTitle title="Админ" />
      <h1 style={{ marginTop: 0 }}>Админ</h1>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>Управление пользователями, споры (решение в течение 48 ч по ТЗ).</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button type="button" className={activeTab === 'stats' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('stats')}>Статистика</button>
        <button type="button" className={activeTab === 'users' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('users')}>Пользователи</button>
        <button type="button" className={activeTab === 'disputes' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('disputes')}>Споры</button>
      </div>

      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {STATS.map((s) => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <>
          <h2 style={{ marginBottom: '0.75rem' }}>Пользователи</h2>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Email</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Роль</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{u.email}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{u.role}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span style={{ color: u.active ? '#16a34a' : '#94a3b8' }}>{u.active ? 'Активен' : 'Неактивен'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'disputes' && (
        <>
          <h2 style={{ marginBottom: '0.75rem' }}>Споры (решить в течение 48 ч)</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Открытые споры по заказам. Выберите решение.</p>
          {disputes.length === 0 ? (
            <p style={{ color: '#64748b' }}>Нет открытых споров.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {disputes.map((o) => {
                const hoursLeft = getHoursLeft(o.disputeOpenedAt)
                const isOverdue = hoursLeft !== null && hoursLeft <= 0
                return (
                  <div key={o.id} className="card" style={{ borderLeft: `4px solid ${isOverdue ? '#dc2626' : '#2563eb'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <strong>{o.id}</strong> — {o.date} · {o.items}
                        <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>{o.total.toLocaleString('ru-RU')} ₽</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                          Причина: {DISPUTE_REASON_LABEL[o.disputeReason || ''] || o.disputeReason}
                          {o.disputeComment && ` — ${o.disputeComment}`}
                        </p>
                        {o.disputeOpenedAt && (
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                            Открыт: {new Date(o.disputeOpenedAt).toLocaleString('ru-RU')}
                            {hoursLeft !== null && (
                              <span style={{ marginLeft: '0.5rem', color: isOverdue ? '#dc2626' : '#64748b' }}>
                                {isOverdue ? 'Дедлайн истёк' : `Осталось ${hoursLeft.toFixed(1)} ч`}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-primary" style={{ fontSize: '0.85rem' }} onClick={() => handleResolve(o.id, 'refund_full')}>
                          Возврат полный
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => handleResolve(o.id, 'refund_partial')}>
                          Возврат частичный
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => handleResolve(o.id, 'reject')}>
                          Отклонить спор
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'stats' && (
        <h2 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>Разделы</h2>
      )}
      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          <div className="card">
            <strong>Модерация</strong>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Товары и отзывы</p>
            <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem' }} disabled>Открыть</button>
          </div>
          <div className="card">
            <strong>Настройки</strong>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>API, домен, уведомления</p>
            <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem' }} disabled>Открыть</button>
          </div>
        </div>
      )}
    </>
  )
}
