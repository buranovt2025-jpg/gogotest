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
        <div className="empty-state">
          <p className="text-muted">
            Вход доступен только при подключённом API (VITE_API_URL).
            <br />
            <small style={{ fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
              Текущий API URL: {import.meta.env.VITE_API_URL || 'не задан'}
              <br />
              Origin: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
            </small>
          </p>
          <Link to="/" className="btn btn-secondary">{t('backLink')}</Link>
        </div>
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
    
    // Валидация на клиенте
    if (!email.trim()) {
      setError('Введите email')
      return
    }
    if (!password.trim()) {
      setError('Введите пароль')
      return
    }
    if (tab === 'register' && password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }
    
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email.trim(), password)
      } else {
        await register(email.trim(), password, role)
      }
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Auth error:', err)
      setError(msg || t('authError'))
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
          {error && (
            <div style={{ 
              color: '#dc2626', 
              fontSize: '0.9rem', 
              marginBottom: '0.75rem',
              padding: '0.75rem',
              background: '#fee2e2',
              borderRadius: '6px',
              border: '1px solid #fca5a5'
            }}>
              <strong>Ошибка:</strong> {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? '…' : tab === 'login' ? t('login') : t('register')}
          </button>
          {isApiEnabled() && (
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
              API: {import.meta.env.VITE_API_URL || window.location.origin + '/api'}
            </p>
          )}
        </form>
      </div>
    </>
  )
}
