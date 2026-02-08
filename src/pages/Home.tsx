import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { useTranslation } from '../i18n/useTranslation'

export default function Home() {
  const { t } = useTranslation()
  return (
    <>
      <PageTitle title={t('homeTitle')} />
      <h1 style={{ marginTop: 0 }}>{t('homeTitle')}</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{t('homeSubtitle')}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <Link to="/buyer" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <strong>{t('roleBuyer')}</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>{t('roleBuyerDesc')}</p>
        </Link>
        <Link to="/seller" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <strong>{t('roleSeller')}</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>{t('roleSellerDesc')}</p>
        </Link>
        <Link to="/courier" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <strong>{t('roleCourier')}</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>{t('roleCourierDesc')}</p>
        </Link>
        <Link to="/admin" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <strong>{t('roleAdmin')}</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>{t('roleAdminDesc')}</p>
        </Link>
      </div>
    </>
  )
}
