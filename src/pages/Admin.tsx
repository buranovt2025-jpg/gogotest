import PageTitle from '../components/PageTitle'

const STATS = [
  { label: 'Заказов за месяц', value: 124 },
  { label: 'Пользователей', value: 89 },
  { label: 'Товаров в каталоге', value: 56 },
]

const MOCK_USERS = [
  { id: '1', email: 'buyer@example.com', role: 'Покупатель', active: true },
  { id: '2', email: 'seller@example.com', role: 'Продавец', active: true },
  { id: '3', email: 'courier@example.com', role: 'Курьер', active: true },
  { id: '4', email: 'support@example.com', role: 'Покупатель', active: false },
]

export default function Admin() {
  return (
    <>
      <PageTitle title="Админ" />
      <h1 style={{ marginTop: 0 }}>Админ</h1>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>Управление пользователями и настройками.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {STATS.map((s) => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: '0.75rem' }}>Пользователи</h2>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem 0.75rem' }}>Email</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Роль</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem 0.75rem' }}>{u.email}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>{u.role}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>
                  <span style={{ color: u.active ? '#16a34a' : '#94a3b8' }}>{u.active ? 'Активен' : 'Неактивен'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>Разделы</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <strong>Модерация</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Товары и отзывы</p>
          <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem' }} disabled>Открыть</button>
        </div>
        <div className="card">
          <strong>Настройки</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>API, домен, уведомления</p>
          <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem' }} disabled>Открыть</button>
        </div>
      </div>
    </>
  )
}
