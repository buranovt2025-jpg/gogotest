import { Outlet, Link, useLocation } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext'
import { useTranslation } from '../i18n/useTranslation'
import CartBadge from './CartBadge'

export default function Layout() {
  const path = useLocation().pathname
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  return (
    <>
      <a href="#main" className="skip-link">{t('skipToContent')}</a>
      <nav className="nav">
        <Link to="/" className="brand">GogoMarket</Link>
        <span style={{ fontWeight: path.startsWith('/buyer') ? 600 : 400 }}><CartBadge /></span>
        <Link to="/seller" style={{ fontWeight: path === '/seller' ? 600 : 400 }}>{t('navSeller')}</Link>
        <Link to="/courier" style={{ fontWeight: path === '/courier' ? 600 : 400 }}>{t('navCourier')}</Link>
        <Link to="/admin" style={{ fontWeight: path === '/admin' ? 600 : 400 }}>{t('navAdmin')}</Link>
        <Link to="/chat" style={{ fontWeight: path === '/chat' ? 600 : 400 }}>{t('navChat')}</Link>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem' }}>
          {(['ru', 'uz', 'en'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.8rem',
                border: 'none',
                background: locale === l ? '#475569' : 'transparent',
                color: locale === l ? '#fff' : '#e2e8f0',
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </span>
      </nav>
      <main id="main" className="layout-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
        {t('footer')}
      </footer>
    </>
  )
}
