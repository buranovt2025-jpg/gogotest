import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { useTranslation } from '../i18n/useTranslation'
import { useAuth } from '../context/AuthContext'
import { useDisputes } from '../hooks/useDisputes'
import { isApiEnabled, apiOrders, apiCouriers, apiAssignCourier } from '../api/client'
import type { ApiOrder } from '../api/client'
import type { Order } from '../data/orders'
import type { DisputeResolution } from '../types'

const STATS_KEYS = ['ordersPerMonth', 'usersCount', 'productsCount'] as const
const STATS = [
  { key: STATS_KEYS[0], value: 124 },
  { key: STATS_KEYS[1], value: 89 },
  { key: STATS_KEYS[2], value: 56 },
] as const

const MOCK_USERS = [
  { id: '1', email: 'buyer@example.com', roleKey: 'roleBuyer' as const, active: true },
  { id: '2', email: 'seller@example.com', roleKey: 'roleSeller' as const, active: true },
  { id: '3', email: 'courier@example.com', roleKey: 'roleCourier' as const, active: true },
  { id: '4', email: 'support@example.com', roleKey: 'roleBuyer' as const, active: false },
]

const DISPUTE_REASON_KEYS: Record<string, 'disputeDamage' | 'disputeCourierNoShow' | 'disputeWrongItem' | 'disputeOther'> = {
  damage: 'disputeDamage',
  courier_no_show: 'disputeCourierNoShow',
  wrong_item: 'disputeWrongItem',
  other: 'disputeOther',
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

type AdminTab = 'stats' | 'users' | 'orders' | 'disputes'

export default function Admin() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('stats')
  const [allOrders, setAllOrders] = useState<ApiOrder[]>([])
  const [couriers, setCouriers] = useState<{ id: string; email: string }[]>([])
  const { disputes, resolveDispute } = useDisputes()

  const fetchOrdersAndCouriers = useCallback(() => {
    if (!isApiEnabled() || !isAuthenticated) return
    apiOrders().then(setAllOrders).catch(() => setAllOrders([]))
    apiCouriers().then(setCouriers).catch(() => setCouriers([]))
  }, [isAuthenticated])

  useEffect(() => {
    if (activeTab === 'orders') fetchOrdersAndCouriers()
  }, [activeTab, fetchOrdersAndCouriers])

  const handleResolve = (orderId: string, resolution: DisputeResolution) => {
    if (!resolution) return
    resolveDispute(orderId, resolution, user?.id ?? 'admin-1')
  }

  const disputeReasonLabel = (reason: string | null | undefined) => {
    if (!reason) return ''
    const key = DISPUTE_REASON_KEYS[reason]
    return key ? t(key) : reason
  }

  return (
    <>
      <PageTitle title={t('navAdmin')} />
      <h1 style={{ marginTop: 0 }}>{t('navAdmin')}</h1>
      {isApiEnabled() && !isAuthenticated && (
        <p style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: 8, marginBottom: '1rem' }}>
          {t('authRequired')} <Link to="/login">{t('login')}</Link> ({t('role')} ADMIN).
        </p>
      )}
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>{t('adminSubtitle')}</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button type="button" className={activeTab === 'stats' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('stats')}>{t('tabStats')}</button>
        <button type="button" className={activeTab === 'users' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('users')}>{t('tabUsers')}</button>
        <button type="button" className={activeTab === 'orders' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('orders')}>{t('tabOrders')}</button>
        <button type="button" className={activeTab === 'disputes' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('disputes')}>{t('tabDisputes')}</button>
      </div>

      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {STATS.map((s) => (
            <div key={s.key} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{t(s.key)}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <>
          <h2 style={{ marginBottom: '0.75rem' }}>{t('tabUsers')}</h2>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Email</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>{t('role')}</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{u.email}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{t(u.roleKey)}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span style={{ color: u.active ? '#16a34a' : '#94a3b8' }}>{u.active ? t('active') : t('inactive')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <>
          <h2 style={{ marginBottom: '0.75rem' }}>{t('tabOrders')}</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>{t('assignCourier')}: {t('orderStatusConfirmed')}.</p>
          {allOrders.length === 0 ? (
            <p style={{ color: '#64748b' }}>{t('noProducts')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {allOrders.map((o) => (
                <div key={o.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <strong>{o.id}</strong> — {o.date} · {o.items}
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.95rem' }}>{Number(o.total).toLocaleString('ru-RU')} ₽</p>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{o.status}</span>
                  </div>
                  {o.status === 'Подтверждён' && couriers.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <select
                        id={`courier-${o.id}`}
                        style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                        aria-label={t('selectCourier')}
                      >
                        <option value="">{t('selectCourier')}</option>
                        {couriers.map((c) => (
                          <option key={c.id} value={c.id}>{c.email}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: '0.85rem' }}
                        onClick={() => {
                          const sel = document.getElementById(`courier-${o.id}`) as HTMLSelectElement
                          const courierId = sel?.value
                          if (courierId) apiAssignCourier(o.id, courierId).then(() => fetchOrdersAndCouriers())
                        }}
                      >
                        {t('assignCourier')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'disputes' && (
        <>
          <h2 style={{ marginBottom: '0.75rem' }}>{t('resolve48h')}</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>{t('disputeIntro')}</p>
          {disputes.length === 0 ? (
            <p style={{ color: '#64748b' }}>{t('noDisputes')}</p>
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
                          {t('disputeReasonLabel')}: {disputeReasonLabel(o.disputeReason)}
                          {o.disputeComment && ` — ${o.disputeComment}`}
                        </p>
                        {o.disputeOpenedAt && (
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                            {t('openedAt')}: {new Date(o.disputeOpenedAt).toLocaleString('ru-RU')}
                            {hoursLeft !== null && (
                              <span style={{ marginLeft: '0.5rem', color: isOverdue ? '#dc2626' : '#64748b' }}>
                                {isOverdue ? t('overdue') : `${t('hoursLeft')} ${hoursLeft.toFixed(1)} ${t('hoursUnit')}`}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-primary" style={{ fontSize: '0.85rem' }} onClick={() => handleResolve(o.id, 'refund_full')}>
                          {t('refundFull')}
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => handleResolve(o.id, 'refund_partial')}>
                          {t('refundPartial')}
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => handleResolve(o.id, 'reject')}>
                          {t('rejectDispute')}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          <div className="card">
            <strong>{t('moderation')}</strong>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>{t('moderationDesc')}</p>
            <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem' }} disabled>{t('openBtn')}</button>
          </div>
          <div className="card">
            <strong>{t('settings')}</strong>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>{t('settingsDesc')}</p>
            <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem' }} disabled>{t('openBtn')}</button>
          </div>
        </div>
      )}
    </>
  )
}
