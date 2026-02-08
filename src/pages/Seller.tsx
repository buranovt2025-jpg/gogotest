import { Link } from 'react-router-dom'

export default function Seller() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Продавец</h1>
      <p>Товары, заказы, описание через ИИ (Gemini).</p>
      <Link to="/">← На главную</Link>
    </div>
  )
}
