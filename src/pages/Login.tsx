import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { useTranslation } from '../i18n/useTranslation'
import { useAuth } from '../context/AuthContext'
import { isApiEnabled } from '../api/client'

type Tab = 'login' | 'register'

const ROLES = [
  { value: 'BUYER', labelKey: 'roleBuyer' as const },
  { value: 'SELLER_FULL', labelKey: 'sellerInventory' as const },
  { value: 'SELLER_SIMPLE', labelKey: 'sellerAds' as const },
  { value: 'COURIER', labelKey: 'roleCourier' as const },
  { value: 'ADMIN', labelKey: 'roleAdmin' as const },
]

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, register, isAuthenticated } = useAuth()
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('BUYER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isApiEnabled()) {
    return (
      <>
        <PageTitle title={t('loginTitle')} />
        <p style={{ color: '#64748b' }}>Вход доступен только при подключённом API (VITE_API_URL).</p>
        <Link to="/" className="btn btn-secondary">{t('backLink')}</Link>
      </>
    )
  }

  if (isAuthenticated) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await register(email, password, role)
      }
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(msg === 'rateLimitExceeded' ? t('rateLimitExceeded') : msg || t('authError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageTitle title={tab === 'login' ? t('loginTitle') : t('registerTitle')} />
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>← {t('backLink')}</Link>
      <div className="card" style={{ maxWidth: 400 }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            type="button"
            className={tab === 'login' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => { setTab('login'); setError('') }}
          >
            {t('loginTitle')}
          </button>
          <button
            type="button"
            className={tab === 'register' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => { setTab('register'); setError('') }}
          >
            {t('registerTitle')}
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
          {tab === 'register' && (
            <>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('role')}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{t(r.labelKey)}</option>
                ))}
              </select>
            </>
          )}
          {error && <p style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? '…' : tab === 'login' ? t('login') : t('register')}
          </button>
        </form>
      </div>
    </>
  )
}
