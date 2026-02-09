import { useState, useEffect, useCallback } from 'react'
import PageTitle from '../components/PageTitle'
import { useTranslation } from '../i18n/useTranslation'
import { useAuth } from '../context/AuthContext'
import { isApiEnabled } from '../api/client'
import { apiMyDeliveries, apiUpdateOrderStatus } from '../api/client'
import type { ApiOrder } from '../api/client'
import { getSocket } from '../api/ws'

const STATUS_KEYS = ['statusWaiting', 'statusEnRoute', 'statusDelivered'] as const
type StatusKey = (typeof STATUS_KEYS)[number]

function statusToKey(status: string): StatusKey {
  if (status === 'В пути') return 'statusEnRoute'
  if (status === 'Доставлен') return 'statusDelivered'
  return 'statusWaiting'
}

export default function Courier() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const [deliveries, setDeliveries] = useState<ApiOrder[]>([])
  const [autoSendLocation, setAutoSendLocation] = useState(false)
  const useApi = isApiEnabled() && isAuthenticated && user?.role === 'COURIER'
  const enRouteIds = deliveries.filter((o) => o.status === 'В пути').map((o) => o.id)

  const fetchDeliveries = useCallback(() => {
    if (!useApi) return
    apiMyDeliveries().then(setDeliveries).catch(() => setDeliveries([]))
  }, [useApi])

  useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  const handleMarkDelivered = (orderId: string) => {
    apiUpdateOrderStatus(orderId, 'Доставлен').then(() => fetchDeliveries())
  }

  const handleSendLocation = (orderId: string) => {
    const socket = getSocket()
    if (!socket) return
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        socket.emit('tracking:location', { orderId, lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {},
      { enableHighAccuracy: true }
    )
  }

  useEffect(() => {
    if (!autoSendLocation || enRouteIds.length === 0) return
    const interval = setInterval(() => {
      enRouteIds.forEach((orderId) => handleSendLocation(orderId))
    }, 30_000)
    return () => clearInterval(interval)
  }, [autoSendLocation, enRouteIds.join(',')])

  if (useApi) {
    return (
      <>
        <PageTitle title={t('navCourier')} />
        <section className="hero">
          <h1>{t('navCourier')}</h1>
          <p className="lead">{t('myDeliveries')}</p>
        </section>
        {enRouteIds.length > 0 && (
          <label className="checkbox-label" style={{ marginBottom: '0.75rem' }}>
            <input type="checkbox" checked={autoSendLocation} onChange={(e) => setAutoSendLocation(e.target.checked)} />
            {t('autoSendLocation')}
          </label>
        )}
        {deliveries.length === 0 ? (
          <div className="empty-state"><p>{t('noProducts')}</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deliveries.map((o) => (
              <div key={o.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <strong>{o.id}</strong> — {o.date} · {o.items}
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.95rem' }}>{Number(o.total).toLocaleString('ru-RU')} ₽</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: 6,
                      fontSize: '0.85rem',
                      background: o.status === 'Доставлен' ? '#dcfce7' : '#fef3c7',
                      color: '#334155',
                    }}
                  >
                    {t(statusToKey(o.status))}
                  </span>
                  {o.status === 'В пути' && (
                    <>
                      <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => handleSendLocation(o.id)}>
                        {t('sendMyLocation')}
                      </button>
                      <button type="button" className="btn btn-primary" style={{ fontSize: '0.85rem' }} onClick={() => handleMarkDelivered(o.id)}>
                        {t('markDelivered')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <PageTitle title={t('navCourier')} />
      <section className="hero">
        <h1>{t('navCourier')}</h1>
        <p className="lead">{t('deliveriesList')}</p>
      </section>
      <div className="empty-state">
        <p className="text-muted">{t('authRequired')} {t('login')} ({t('role')} {t('navCourier')}).</p>
      </div>
    </>
  )
}
