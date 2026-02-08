import { Link } from 'react-router-dom'

export default function Courier() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Курьер</h1>
      <p>Маршруты, доставки, статусы.</p>
      <Link to="/">← На главную</Link>
    </div>
  )
}
