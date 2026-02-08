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
        <p style={{ color: '#475569' }}>Вход доступен только при подключённом API (VITE_API_URL).</p>
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
        <div role="tablist" aria-label={t('loginTitle')} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'login'}
            aria-controls="login-panel"
            id="tab-login"
            className={tab === 'login' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => { setTab('login'); setError('') }}
          >
            {t('loginTitle')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'register'}
            aria-controls="login-panel"
            id="tab-register"
            className={tab === 'register' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => { setTab('register'); setError('') }}
          >
            {t('registerTitle')}
          </button>
        </div>
        <form id="login-panel" role="tabpanel" aria-labelledby={tab === 'login' ? 'tab-login' : 'tab-register'} onSubmit={handleSubmit} aria-label={tab === 'login' ? t('loginTitle') : t('registerTitle')}>
          <label htmlFor="login-email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>{t('email')}</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            aria-required="true"
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', borderRadius: 6, border: '1px solid #64748b', color: '#0f172a' }}
          />
          <label htmlFor="login-password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>{t('password')}</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            aria-required="true"
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', borderRadius: 6, border: '1px solid #64748b', color: '#0f172a' }}
          />
          {tab === 'register' && (
            <>
              <label htmlFor="login-role" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>{t('role')}</label>
              <select
                id="login-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                aria-label={t('role')}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', borderRadius: 6, border: '1px solid #64748b', color: '#0f172a' }}
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
