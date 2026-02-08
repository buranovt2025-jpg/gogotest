import { Link } from 'react-router-dom'

export default function Buyer() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Покупатель</h1>
      <p>Каталог, корзина, заказы.</p>
      <Link to="/">← На главную</Link>
    </div>
  )
}
