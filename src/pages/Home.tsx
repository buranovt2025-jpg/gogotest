import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { useTranslation } from '../i18n/useTranslation'

export default function Home() {
  const { t } = useTranslation()
  return (
    <>
      <PageTitle title={t('homeTitle')} />
      <section className="hero">
        <h1>{t('homeTitle')}</h1>
        <p className="lead">{t('homeSubtitle')}</p>
      </section>
      <section className="role-grid" aria-label={t('homeTitle')}>
        <Link to="/buyer" className="role-card">
          <strong>{t('roleBuyer')}</strong>
          <span>{t('roleBuyerDesc')}</span>
        </Link>
        <Link to="/seller" className="role-card">
          <strong>{t('roleSeller')}</strong>
          <span>{t('roleSellerDesc')}</span>
        </Link>
        <Link to="/courier" className="role-card">
          <strong>{t('roleCourier')}</strong>
          <span>{t('roleCourierDesc')}</span>
        </Link>
        <Link to="/admin" className="role-card">
          <strong>{t('roleAdmin')}</strong>
          <span>{t('roleAdminDesc')}</span>
        </Link>
      </section>
    </>
  )
}
