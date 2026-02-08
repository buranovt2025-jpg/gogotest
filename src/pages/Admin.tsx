import { Link } from 'react-router-dom'

export default function Admin() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Админ</h1>
      <p>Пользователи, модерация, настройки.</p>
      <Link to="/">← На главную</Link>
    </div>
  )
}
