import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>GogoMarket</h1>
      <p>Выберите роль для входа:</p>
      <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/buyer">Покупатель</Link>
        <Link to="/seller">Продавец</Link>
        <Link to="/courier">Курьер</Link>
        <Link to="/admin">Админ</Link>
      </nav>
    </div>
  )
}
