import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'

export default function Home() {
  return (
    <>
      <PageTitle title="Главная" />
      <h1 style={{ marginTop: 0 }}>GogoMarket</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Маркетплейс: покупайте, продавайте, доставляйте.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <Link to="/buyer" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <strong>Покупатель</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Каталог, корзина, заказы</p>
        </Link>
        <Link to="/seller" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <strong>Продавец</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Товары и ИИ-описания</p>
        </Link>
        <Link to="/courier" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <strong>Курьер</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Доставки и маршруты</p>
        </Link>
        <Link to="/admin" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <strong>Админ</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Пользователи и настройки</p>
        </Link>
      </div>
    </>
  )
}
